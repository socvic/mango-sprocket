;; Daily check-in streak tracker with social and campaign primitives.


;;; === Constants ===
(define-constant CHECKIN_WINDOW_BLOCKS u144)
;; ~144 blocks = ~24 hours at ~10min per block
(define-constant GRACE_BLOCKS u24)
;; ~24 blocks = ~4 hours grace after window

;;
;;; === Error Codes ===
(define-constant ERR_TOO_SOON (err u100))
(define-constant ERR_INVALID_CHALLENGE (err u101))
(define-constant ERR_ALREADY_JOINED (err u102))
(define-constant ERR_NOT_JOINED (err u103))
(define-constant ERR_NOT_ACTIVE (err u104))
(define-constant ERR_NOT_IN_WINDOW (err u105))
(define-constant ERR_NO_FREEZE_PASS (err u106))
(define-constant ERR_NOT_MISSED (err u107))
(define-constant ERR_TOO_MUCH_MISSED (err u108))
(define-constant ERR_SELF_FRIEND (err u109))
(define-constant ERR_ALREADY_FRIEND (err u110))
(define-constant ERR_NOT_FRIEND (err u111))
(define-constant ERR_INVALID_GROUP (err u112))
(define-constant ERR_GROUP_FULL (err u113))
(define-constant ERR_ALREADY_MEMBER (err u114))
(define-constant ERR_NOT_MEMBER (err u115))
(define-constant ERR_OWNER_ONLY (err u116))
(define-constant ERR_OWNER_CANNOT_LEAVE (err u117))

(define-data-var total-users uint u0)
(define-data-var total-checkins uint u0)
(define-data-var challenge-nonce uint u0)
(define-data-var group-nonce uint u0)

(define-map profiles
	principal
	{
		last-checkin: uint,
		streak: uint,
		best-streak: uint,
		total-checkins: uint,
		badge-level: uint,
		freeze-passes: uint,
	}
)

(define-map checkin-events
	{
		user: principal,
		id: uint,
	}
	{
		height: uint,
		note: (optional (string-utf8 140)),
	}
)

(define-map user-event-count principal uint)
(define-map latest-notes principal (string-utf8 140))

(define-map challenges
	uint
	{
		creator: principal,
		title: (string-utf8 48),
		start-height: uint,
		end-height: uint,
		active: bool,
		participants: uint,
	}
)

(define-map challenge-members
	{
		challenge-id: uint,
		user: principal,
	}
	bool
)

(define-map challenge-submissions
	{
		challenge-id: uint,
		user: principal,
	}
	uint
)

(define-map friends
	{
		user: principal,
		friend: principal,
	}
	bool
)

(define-map groups
	uint
	{
		owner: principal,
		name: (string-utf8 48),
		members: uint,
		max-members: uint,
		active: bool,
	}
)

(define-map group-members
	{
		group-id: uint,
		user: principal,
	}
	bool
)

(define-public (check-in)
	(perform-check-in none)
)

(define-public (check-in-with-note (note (optional (string-utf8 140))))
	(perform-check-in note)
)

(define-public (use-freeze-pass)
	(let (
			(profile (get-profile-internal tx-sender))
			(last-checkin (get last-checkin profile))
			(freeze-passes (get freeze-passes profile))
			(miss-min-height (+ last-checkin CHECKIN_WINDOW_BLOCKS GRACE_BLOCKS))
			(miss-max-height (+ last-checkin (* u2 CHECKIN_WINDOW_BLOCKS) GRACE_BLOCKS))
			(height burn-block-height)
		)
		(asserts! (> last-checkin u0) ERR_NOT_MISSED)
		(asserts! (> freeze-passes u0) ERR_NO_FREEZE_PASS)
		(asserts! (> height miss-min-height) ERR_NOT_MISSED)
		(asserts! (<= height miss-max-height) ERR_TOO_MUCH_MISSED)
		(map-set profiles tx-sender {
			last-checkin: height,
			streak: (get streak profile),
			best-streak: (get best-streak profile),
			total-checkins: (get total-checkins profile),
			badge-level: (get badge-level profile),
			freeze-passes: (- freeze-passes u1),
		})
		(print {
			event: "freeze-used",
			account: tx-sender,
			block-height: height,
			freeze-passes-left: (- freeze-passes u1),
		})
		(ok {
			streak: (get streak profile),
			freeze-passes: (- freeze-passes u1),
		})
	)
)

(define-public (create-challenge (title (string-utf8 48)) (start-height uint) (end-height uint))
	(begin
		(asserts! (> end-height start-height) ERR_INVALID_CHALLENGE)
		(asserts! (>= start-height burn-block-height) ERR_INVALID_CHALLENGE)
		(let ((next-id (+ (var-get challenge-nonce) u1)))
			(var-set challenge-nonce next-id)
			(map-set challenges next-id {
				creator: tx-sender,
				title: title,
				start-height: start-height,
				end-height: end-height,
				active: true,
				participants: u0,
			})
			(print {
				event: "challenge-created",
				challenge-id: next-id,
				creator: tx-sender,
			})
			(ok next-id)
		)
	)
)

(define-public (set-challenge-active (challenge-id uint) (is-active bool))
	(let ((challenge (unwrap! (map-get? challenges challenge-id) ERR_INVALID_CHALLENGE)))
		(asserts! (is-eq tx-sender (get creator challenge)) ERR_OWNER_ONLY)
		(map-set challenges challenge-id {
			creator: (get creator challenge),
			title: (get title challenge),
			start-height: (get start-height challenge),
			end-height: (get end-height challenge),
			active: is-active,
			participants: (get participants challenge),
		})
		(ok true)
	)
)

(define-public (join-challenge (challenge-id uint))
	(let ((challenge (unwrap! (map-get? challenges challenge-id) ERR_INVALID_CHALLENGE)))
		(asserts! (get active challenge) ERR_NOT_ACTIVE)
		(asserts! (<= burn-block-height (get end-height challenge)) ERR_NOT_IN_WINDOW)
		(asserts! (not (is-some (map-get? challenge-members { challenge-id: challenge-id, user: tx-sender }))) ERR_ALREADY_JOINED)
		(map-set challenge-members { challenge-id: challenge-id, user: tx-sender } true)
		(map-set challenges challenge-id {
			creator: (get creator challenge),
			title: (get title challenge),
			start-height: (get start-height challenge),
			end-height: (get end-height challenge),
			active: (get active challenge),
			participants: (+ (get participants challenge) u1),
		})
		(ok true)
	)
)

(define-public (submit-challenge-checkin (challenge-id uint) (note (optional (string-utf8 140))))
	(let (
			(challenge (unwrap! (map-get? challenges challenge-id) ERR_INVALID_CHALLENGE))
			(check-in-result (try! (perform-check-in note)))
			(current-submissions (default-to u0 (map-get? challenge-submissions { challenge-id: challenge-id, user: tx-sender })))
		)
		(asserts! (get active challenge) ERR_NOT_ACTIVE)
		(asserts! (is-some (map-get? challenge-members { challenge-id: challenge-id, user: tx-sender })) ERR_NOT_JOINED)
		(asserts! (>= burn-block-height (get start-height challenge)) ERR_NOT_IN_WINDOW)
		(asserts! (<= burn-block-height (get end-height challenge)) ERR_NOT_IN_WINDOW)
		(map-set challenge-submissions { challenge-id: challenge-id, user: tx-sender } (+ current-submissions u1))
		(ok {
			streak: (get streak check-in-result),
			badge-level: (get badge-level check-in-result),
			challenge-submissions: (+ current-submissions u1),
		})
	)
)

(define-public (add-friend (friend principal))
	(begin
		(asserts! (not (is-eq tx-sender friend)) ERR_SELF_FRIEND)
		(asserts! (not (is-some (map-get? friends { user: tx-sender, friend: friend }))) ERR_ALREADY_FRIEND)
		(map-set friends { user: tx-sender, friend: friend } true)
		(map-set friends { user: friend, friend: tx-sender } true)
		(ok true)
	)
)

(define-public (remove-friend (friend principal))
	(begin
		(asserts! (is-some (map-get? friends { user: tx-sender, friend: friend })) ERR_NOT_FRIEND)
		(map-delete friends { user: tx-sender, friend: friend })
		(map-delete friends { user: friend, friend: tx-sender })
		(ok true)
	)
)

(define-public (create-group (name (string-utf8 48)) (max-members uint))
	(begin
		(asserts! (>= max-members u2) ERR_INVALID_GROUP)
		(let ((next-id (+ (var-get group-nonce) u1)))
			(var-set group-nonce next-id)
			(map-set groups next-id {
				owner: tx-sender,
				name: name,
				members: u1,
				max-members: max-members,
				active: true,
			})
			(map-set group-members { group-id: next-id, user: tx-sender } true)
			(ok next-id)
		)
	)
)

(define-public (set-group-active (group-id uint) (is-active bool))
	(let ((group (unwrap! (map-get? groups group-id) ERR_INVALID_GROUP)))
		(asserts! (is-eq tx-sender (get owner group)) ERR_OWNER_ONLY)
		(map-set groups group-id {
			owner: (get owner group),
			name: (get name group),
			members: (get members group),
			max-members: (get max-members group),
			active: is-active,
		})
		(ok true)
	)
)

(define-public (join-group (group-id uint))
	(let ((group (unwrap! (map-get? groups group-id) ERR_INVALID_GROUP)))
		(asserts! (get active group) ERR_NOT_ACTIVE)
		(asserts! (not (is-some (map-get? group-members { group-id: group-id, user: tx-sender }))) ERR_ALREADY_MEMBER)
		(asserts! (< (get members group) (get max-members group)) ERR_GROUP_FULL)
		(map-set group-members { group-id: group-id, user: tx-sender } true)
		(map-set groups group-id {
			owner: (get owner group),
			name: (get name group),
			members: (+ (get members group) u1),
			max-members: (get max-members group),
			active: (get active group),
		})
		(ok true)
	)
)

(define-public (leave-group (group-id uint))
	(let ((group (unwrap! (map-get? groups group-id) ERR_INVALID_GROUP)))
		(asserts! (is-some (map-get? group-members { group-id: group-id, user: tx-sender })) ERR_NOT_MEMBER)
		(asserts! (not (is-eq tx-sender (get owner group))) ERR_OWNER_CANNOT_LEAVE)
		(map-delete group-members { group-id: group-id, user: tx-sender })
		(map-set groups group-id {
			owner: (get owner group),
			name: (get name group),
			members: (- (get members group) u1),
			max-members: (get max-members group),
			active: (get active group),
		})
		(ok true)
	)
)

(define-read-only (get-profile (who principal))
	(ok (get-profile-internal who))
)

(define-read-only (get-badge-level (who principal))
	(ok (get badge-level (get-profile-internal who)))
)

(define-read-only (get-latest-note (who principal))
	(ok (map-get? latest-notes who))
)

(define-read-only (get-user-event-count (who principal))
	(ok (default-to u0 (map-get? user-event-count who)))
)

(define-read-only (get-checkin-event (who principal) (id uint))
	(ok (map-get? checkin-events { user: who, id: id }))
)

(define-read-only (can-check-in (who principal))
	(let (
			(profile (get-profile-internal who))
			(last-checkin (get last-checkin profile))
			(height burn-block-height)
		)
		(ok
			(or
				(is-eq last-checkin u0)
				(>= height (+ last-checkin CHECKIN_WINDOW_BLOCKS))
			)
		)
	)
)

(define-read-only (next-checkin-height (who principal))
	(let ((last-checkin (get last-checkin (get-profile-internal who))))
		(ok
			(if (is-eq last-checkin u0)
				u0
				(+ last-checkin CHECKIN_WINDOW_BLOCKS)
			)
		)
	)
)

(define-read-only (get-global-stats)
	(ok {
		total-users: (var-get total-users),
		total-checkins: (var-get total-checkins),
		total-challenges: (var-get challenge-nonce),
		total-groups: (var-get group-nonce),
	})
)

(define-read-only (get-challenge (challenge-id uint))
	(ok (map-get? challenges challenge-id))
)

(define-read-only (has-joined-challenge (challenge-id uint) (who principal))
	(ok (is-some (map-get? challenge-members { challenge-id: challenge-id, user: who })))
)

(define-read-only (get-challenge-submissions (challenge-id uint) (who principal))
	(ok (default-to u0 (map-get? challenge-submissions { challenge-id: challenge-id, user: who })))
)

(define-read-only (is-friend (who principal) (friend principal))
	(ok (is-some (map-get? friends { user: who, friend: friend })))
)

(define-read-only (get-friend-streak (friend principal))
	(begin
		(asserts! (is-some (map-get? friends { user: tx-sender, friend: friend })) ERR_NOT_FRIEND)
		(ok (get streak (get-profile-internal friend)))
	)
)

(define-read-only (get-group (group-id uint))
	(ok (map-get? groups group-id))
)

(define-read-only (is-group-member (group-id uint) (who principal))
	(ok (is-some (map-get? group-members { group-id: group-id, user: who })))
)

(define-read-only (get-group-member-streak (group-id uint) (who principal))
	(begin
		(asserts! (is-some (map-get? group-members { group-id: group-id, user: who })) ERR_NOT_MEMBER)
		(ok (get streak (get-profile-internal who)))
	)
)

(define-private (perform-check-in (note (optional (string-utf8 140))))
	(let (
			(height burn-block-height)
			(profile (get-profile-internal tx-sender))
			(last-checkin (get last-checkin profile))
			(current-streak (get streak profile))
			(current-best (get best-streak profile))
			(current-total (get total-checkins profile))
			(current-badge (get badge-level profile))
			(current-freeze (get freeze-passes profile))
			(is-first-checkin (is-eq last-checkin u0))
			(next-eligible (+ last-checkin CHECKIN_WINDOW_BLOCKS))
			(continuation-deadline (+ next-eligible GRACE_BLOCKS))
			(event-count (default-to u0 (map-get? user-event-count tx-sender)))
		)
		(asserts!
			(or is-first-checkin (>= height next-eligible))
			ERR_TOO_SOON
		)
		(let (
				(next-streak
					(if is-first-checkin
						u1
						(if (<= height continuation-deadline)
							(+ current-streak u1)
							u1
						)
					)
				)
				(next-best
					(if (> next-streak current-best)
						next-streak
						current-best
					)
				)
				(next-user-total (+ current-total u1))
				(next-badge (compute-badge-level next-streak))
				(freeze-after-first (if is-first-checkin (+ current-freeze u1) current-freeze))
				(next-freeze
					(if (> (compute-badge-level next-streak) current-badge)
						(+ freeze-after-first u1)
						freeze-after-first
					)
				)
				(next-event-id (+ event-count u1))
			)
			(map-set profiles tx-sender {
				last-checkin: height,
				streak: next-streak,
				best-streak: next-best,
				total-checkins: next-user-total,
				badge-level: next-badge,
				freeze-passes: next-freeze,
			})
			(map-set user-event-count tx-sender next-event-id)
			(map-set checkin-events { user: tx-sender, id: next-event-id } {
				height: height,
				note: note,
			})
			(match note
				memo (map-set latest-notes tx-sender memo)
				true
			)
			(var-set total-checkins (+ (var-get total-checkins) u1))
			(if is-first-checkin
				(var-set total-users (+ (var-get total-users) u1))
				true
			)
			(print {
				event: "check-in",
				account: tx-sender,
				block-height: height,
				streak: next-streak,
				badge-level: next-badge,
			})
			(ok {
				streak: next-streak,
				best-streak: next-best,
				badge-level: next-badge,
				total-checkins: (var-get total-checkins),
				freeze-passes: next-freeze,
			})
		)
	)
)

(define-private (compute-badge-level (streak uint))
	(if (>= streak u365)
		u4
		(if (>= streak u100)
			u3
			(if (>= streak u30)
				u2
				(if (>= streak u7)
					u1
					u0
				)
			)
		)
	)
)

(define-private (get-profile-internal (who principal))
	(default-to
		{
			last-checkin: u0,
			streak: u0,
			best-streak: u0,
			total-checkins: u0,
			badge-level: u0,
			freeze-passes: u0,
		}
		(map-get? profiles who)
	)
)

