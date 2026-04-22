#!/bin/bash
set -e
cd /home/mainnetforker/Desktop/Talent/mango-sprocket

git config user.email "umorenvictor22@gmail.com"
git config user.name "umorenvictor22"

C="clarity/contracts/daily-streaks.clar"
F="frontend/src/App.tsx"
CSS="frontend/src/App.css"
S="clarity/script.ts"
T="clarity/tests/daily-streaks.test.ts"
IDX="frontend/src/index.css"
RMD="README.md"

# 1
sed -i '2a\\' "$C"
git add -A && git commit -m "style(clar): add spacing after file header comment"

# 2
sed -i '/(define-constant CHECKIN_WINDOW_BLOCKS/i ;;; === Constants ===' "$C"
git add -A && git commit -m "docs(clar): add constants section header"

# 3
sed -i '/(define-constant ERR_TOO_SOON/i ;;' "$C"
git add -A && git commit -m "style(clar): add spacing before error codes"

# 4
sed -i '/(define-constant CHECKIN_WINDOW_BLOCKS u144)/a ;; ~144 blocks = ~24 hours at ~10min per block' "$C"
git add -A && git commit -m "docs(clar): document CHECKIN_WINDOW_BLOCKS rationale"

# 5
sed -i '/(define-constant GRACE_BLOCKS u24)/a ;; ~24 blocks = ~4 hours grace after window' "$C"
git add -A && git commit -m "docs(clar): document GRACE_BLOCKS rationale"

# 6
sed -i '/(define-constant ERR_TOO_SOON (err u100))/i ;;; === Error Codes ===' "$C"
git add -A && git commit -m "docs(clar): add error codes section header"

# 7
sed -i '/(define-constant ERR_TOO_SOON (err u100))/a ;; Returned when user tries to check in before the next eligible window' "$C"
git add -A && git commit -m "docs(clar): add doc comment for ERR_TOO_SOON"

# 8
sed -i '/(define-constant ERR_INVALID_CHALLENGE (err u101))/a ;; Returned for invalid or malformed challenge parameters' "$C"
git add -A && git commit -m "docs(clar): add doc comment for ERR_INVALID_CHALLENGE"

# 9
sed -i '/(define-constant ERR_ALREADY_JOINED (err u102))/a ;; Returned when user attempts to join a challenge they already joined' "$C"
git add -A && git commit -m "docs(clar): add doc comment for ERR_ALREADY_JOINED"

# 10
sed -i '/(define-constant ERR_NOT_JOINED (err u103))/a ;; Returned when a non-member tries to submit a challenge check-in' "$C"
git add -A && git commit -m "docs(clar): add doc comment for ERR_NOT_JOINED"

# 11
sed -i '/(define-constant ERR_NOT_ACTIVE (err u104))/a ;; Returned when interacting with an inactive challenge or group' "$C"
git add -A && git commit -m "docs(clar): add doc comment for ERR_NOT_ACTIVE"

# 12
sed -i '/(define-constant ERR_NO_FREEZE_PASS (err u106))/a ;; Returned when user has no freeze passes available' "$C"
git add -A && git commit -m "docs(clar): add doc comment for ERR_NO_FREEZE_PASS"

# 13
sed -i '/(define-constant ERR_SELF_FRIEND (err u109))/a ;; Returned when user tries to add themselves as a friend' "$C"
git add -A && git commit -m "docs(clar): add doc comment for ERR_SELF_FRIEND"

# 14
sed -i '/(define-constant ERR_GROUP_FULL (err u113))/a ;; Returned when group has reached its max-members capacity' "$C"
git add -A && git commit -m "docs(clar): add doc comment for ERR_GROUP_FULL"

# 15
sed -i '/(define-constant ERR_OWNER_CANNOT_LEAVE (err u117))/a ;; Returned when group owner attempts to leave their own group' "$C"
git add -A && git commit -m "docs(clar): add doc comment for ERR_OWNER_CANNOT_LEAVE"

# 16
sed -i '/(define-data-var total-users/i ;;; === Data Vars (Global Counters) ===' "$C"
git add -A && git commit -m "docs(clar): add data-vars section header"

# 17
sed -i '/(define-map profiles/i ;;; === Maps ===' "$C"
git add -A && git commit -m "docs(clar): add maps section header"

# 18
sed -i '/freeze-passes: uint,$/a ;; Stores per-user streak, badge, and freeze pass state' "$C"
git add -A && git commit -m "docs(clar): document profiles map purpose"

# 19
sed -i '/participants: uint,$/a ;; Stores challenge metadata keyed by challenge id' "$C"
git add -A && git commit -m "docs(clar): document challenges map purpose"

# 20
sed -i '/(define-map friends$/a ;; Bidirectional friend relationship map' "$C"
git add -A && git commit -m "docs(clar): document friends map purpose"

# 21
sed -i '/(define-map groups$/a ;; Stores group metadata keyed by group id' "$C"
git add -A && git commit -m "docs(clar): document groups map purpose"

# 22
sed -i '/(define-public (check-in))/i ;;; === Public Functions ===' "$C"
git add -A && git commit -m "docs(clar): add public functions section header"

# 23
sed -i '/(define-public (check-in))/a ;; Perform a daily check-in without a proof note' "$C"
git add -A && git commit -m "docs(clar): add doc comment for check-in"

# 24
sed -i '/(define-public (check-in-with-note/a ;; Perform a daily check-in with an optional proof note (max 140 chars)' "$C"
git add -A && git commit -m "docs(clar): add doc comment for check-in-with-note"

# 25
sed -i '/(define-public (use-freeze-pass))/a ;; Use a freeze pass to preserve streak after missing a check-in window' "$C"
git add -A && git commit -m "docs(clar): add doc comment for use-freeze-pass"

# 26
sed -i '/(define-public (create-challenge/a ;; Create a new challenge with a title, start height, and end height' "$C"
git add -A && git commit -m "docs(clar): add doc comment for create-challenge"

# 27
sed -i '/(define-public (add-friend/a ;; Add a bidirectional friend relationship' "$C"
git add -A && git commit -m "docs(clar): add doc comment for add-friend"

# 28
sed -i '/(define-public (remove-friend/a ;; Remove the bidirectional friend relationship' "$C"
git add -A && git commit -m "docs(clar): add doc comment for remove-friend"

# 29
sed -i '/(define-public (create-group/a ;; Create a new group with a name and maximum member count (min 2)' "$C"
git add -A && git commit -m "docs(clar): add doc comment for create-group"

# 30
sed -i '/(define-read-only (get-profile/i ;;; === Read-Only Functions ===' "$C"
git add -A && git commit -m "docs(clar): add read-only functions section header"

# 31
sed -i '/(define-read-only (get-profile/a ;; Returns the full profile tuple for a given principal' "$C"
git add -A && git commit -m "docs(clar): add doc comment for get-profile"

# 32
sed -i '/(define-read-only (get-badge-level/a ;; Returns the badge level (0-4) for a given principal based on streak' "$C"
git add -A && git commit -m "docs(clar): add doc comment for get-badge-level"

# 33
sed -i '/(define-read-only (can-check-in/a ;; Returns whether the given principal is eligible to check in now' "$C"
git add -A && git commit -m "docs(clar): add doc comment for can-check-in"

# 34
sed -i '/(define-private (perform-check-in/i ;;; === Private Functions ===' "$C"
git add -A && git commit -m "docs(clar): add private functions section header"

# 35
sed -i '/(define-private (perform-check-in/a ;; Internal: handles check-in logic including streak calculation and badge upgrades' "$C"
git add -A && git commit -m "docs(clar): add doc comment for perform-check-in"

# 36
sed -i '/(define-private (compute-badge-level/i ;;; Badge thresholds: 7 days = level 1, 30 = 2, 100 = 3, 365 = 4' "$C"
git add -A && git commit -m "docs(clar): document badge level thresholds"

# 37
sed -i '/(define-private (get-profile-internal/a ;; Internal: returns profile or default zero-value tuple if not found' "$C"
git add -A && git commit -m "docs(clar): add doc comment for get-profile-internal"

# 38 - Frontend: JSDoc for Stats type
sed -i '11i\/** Global contract statistics from get-global-stats */' "$F"
git add -A && git commit -m "docs(frontend): add JSDoc for Stats type"

# 39 - Frontend: JSDoc for Profile type
sed -i '/^type Profile/i\/** User profile data from the contract */' "$F"
git add -A && git commit -m "docs(frontend): add JSDoc for Profile type"

# 40 - Frontend: JSDoc for ChallengeDetails type
sed -i '/^type ChallengeDetails/i\/** Challenge details including user-specific join and submission state */' "$F"
git add -A && git commit -m "docs(frontend): add JSDoc for ChallengeDetails type"

# 41 - Frontend: JSDoc for App component
sed -i '/^function App()/i\/**\n * Main application component for the Daily Check-In Streaks dApp.\n * Handles wallet connection, contract interactions, and state display.\n */' "$F"
git add -A && git commit -m "docs(frontend): add JSDoc for App component"

# 42 - Frontend: comment for contract config
sed -i '/^const CONTRACT_ADDRESS/i\/\/ Contract configuration from environment variables' "$F"
git add -A && git commit -m "docs(frontend): add comment for contract config constants"

# 43 - Frontend: comment for callReadOnly
sed -i '/^const callReadOnly/i\/\/ Call a read-only contract function via the Stacks API' "$F"
git add -A && git commit -m "docs(frontend): add comment for callReadOnly utility"

# 44 - Frontend: comment for callTx
sed -i '/^const callTx/i\/\/ Submit a contract call transaction via the connected wallet' "$F"
git add -A && git commit -m "docs(frontend): add comment for callTx utility"

# 45 - Frontend: comment for refreshStats
sed -i '/^const refreshStats/i\/\/ Fetch global stats from the contract' "$F"
git add -A && git commit -m "docs(frontend): add comment for refreshStats"

# 46 - Frontend: comment for refreshProfile
sed -i '/^const refreshProfile/i\/\/ Fetch user profile, check-in eligibility, and latest note' "$F"
git add -A && git commit -m "docs(frontend): add comment for refreshProfile"

# 47 - CSS: file header
sed -i '1i\/*\n * Daily Check-In Streaks — App Styles\n * Color palette: warm earth tones with teal accent buttons\n */' "$CSS"
git add -A && git commit -m "docs(css): add file header comment to App.css"

# 48 - CSS: layout section
sed -i '/^\.page/i\/* === Layout === */' "$CSS"
git add -A && git commit -m "docs(css): add layout section comment"

# 49 - CSS: cards section
sed -i '/^\.card {/i\/* === Cards === */' "$CSS"
git add -A && git commit -m "docs(css): add cards section comment"

# 50 - CSS: buttons section
sed -i '/^button {/i\/* === Buttons === */' "$CSS"
git add -A && git commit -m "docs(css): add buttons section comment"

# 51 - index.css header
sed -i '1i\/*\n * Daily Check-In Streaks — Global Reset & Root Styles\n */' "$IDX"
git add -A && git commit -m "docs(css): add file header comment to index.css"

# 52 - script.ts: file header
sed -i '1i\/**\n * Burst transaction script for load-testing the daily-streaks contract.\n * Generates random contract interactions from derived wallet accounts.\n */' "$S"
git add -A && git commit -m "docs(script): add file header comment to script.ts"

# 53 - script.ts: config section
sed -i '/^const STACKS_API_URL/i\/\/ === Configuration ===' "$S"
git add -A && git commit -m "docs(script): add configuration section comment"

# 54 - script.ts: JSDoc for delay
sed -i '/^function delay/i\/** Simple promise-based delay utility */' "$S"
git add -A && git commit -m "docs(script): add JSDoc for delay function"

# 55 - script.ts: JSDoc for runInBatches
sed -i '/^async function runInBatches/i\/**\n * Process items in controlled batches with delay between batches.\n * Respects API rate limits by spacing out requests.\n */' "$S"
git add -A && git commit -m "docs(script): add JSDoc for runInBatches function"

# 56 - script.ts: JSDoc for fetchNonce
sed -i '/^async function fetchNonce/i\/** Fetch the next nonce for a given address from the Stacks API */' "$S"
git add -A && git commit -m "docs(script): add JSDoc for fetchNonce function"

# 57 - script.ts: JSDoc for broadcastWithRetry
sed -i '/^async function broadcastWithRetry/i\/**\n * Broadcast a signed transaction with exponential backoff retry.\n * Retries on 429 and 5xx responses.\n */' "$S"
git add -A && git commit -m "docs(script): add JSDoc for broadcastWithRetry function"

# 58 - test file: file header
sed -i '1i\/**\n * Unit tests for the daily-streaks Clarity contract.\n * Uses Clarinet SDK simnet for on-chain simulation.\n */' "$T"
git add -A && git commit -m "docs(test): add file header comment to test file"

# 59 - test file: describe block comment
sed -i '/^describe("daily-streaks"/i\/\/ Test suite covering check-in logic, streaks, badges, challenges, friends, groups, and freeze passes' "$T"
git add -A && git commit -m "docs(test): add comment above describe block"

# 60 - README: add project tagline
sed -i '1c # Daily Check-In Streaks (Standalone Project)\n\n> An on-chain daily habit tracker built on Stacks with Clarity smart contracts.' "$RMD"
git add -A && git commit -m "docs: add project tagline to README"

rm -f commit.sh
echo "All 60 commits created successfully!"
