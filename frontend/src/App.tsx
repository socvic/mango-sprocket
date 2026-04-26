/**
 * Entry point for the Daily Check-In Streaks application.
 * Connects to the Stacks blockchain via wallet integration.
 *
 * @module App
 */
import { connect, disconnect, isConnected } from '@stacks/connect'
import { Cl, cvToHex, type ClarityValue } from '@stacks/transactions'
import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { CONTRACT_ADDRESS, CONTRACT_ID } from './config/stacks'
import { formatShortAddress } from './lib/format'
import { callReadOnly as callReadOnlyApi } from './lib/stacksReadOnly'
import { callContract } from './lib/stacksTx'
import type { ChallengeDetails, Profile, Stats } from './types/contract'

/**
 * Main application component for the Daily Check-In Streaks dApp.
 * Handles wallet connection, contract interactions, and state display.
 */
function App() {
  const [address, setAddress] = useState('')
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCheckins: 0,
    totalChallenges: 0,
    totalGroups: 0,
  })
  const [profile, setProfile] = useState<Profile>({
    streak: 0,
    bestStreak: 0,
    totalCheckins: 0,
    badgeLevel: 0,
    freezePasses: 0,
  })
  const [canCheckIn, setCanCheckIn] = useState(false)
  const [nextHeight, setNextHeight] = useState(0)
  const [latestNote, setLatestNote] = useState('')
  const [dailyNote, setDailyNote] = useState('')

  const [challengeTitle, setChallengeTitle] = useState('')
  const [challengeStart, setChallengeStart] = useState('')
  const [challengeEnd, setChallengeEnd] = useState('')
  const [challengeLookupId, setChallengeLookupId] = useState('1')
  const [challengeNote, setChallengeNote] = useState('')
  const [challenge, setChallenge] = useState<ChallengeDetails | null>(null)

  const [friendPrincipal, setFriendPrincipal] = useState('')
  const [groupName, setGroupName] = useState('')
  const [groupMaxMembers, setGroupMaxMembers] = useState('5')
  const [joinGroupId, setJoinGroupId] = useState('1')

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('Ready')

  const contractId = CONTRACT_ID
  const isWalletConnected = Boolean(address)
  const shortAddress = useMemo(() => {
    if (!address) return 'No wallet connected'
    return formatShortAddress(address)
  }, [address])

  // Call a read-only contract function via the Stacks API
  const callReadOnly = useCallback(
    async (functionName: string, args: string[] = []) => {
      const sender = address || CONTRACT_ADDRESS
      return callReadOnlyApi(functionName, args, sender)
    },
    [address],
  )

// Submit a contract call transaction via the connected wallet
  const callTx = useCallback(
    async (functionName: string, functionArgs: ClarityValue[]) => {
      return callContract(contractId as `${string}.${string}`, functionName, functionArgs)
    },
    [contractId],
  )

// Fetch global stats from the contract
  const refreshStats = useCallback(async () => {
    const response = await callReadOnly('get-global-stats')
    const tuple = response.value.value
    setStats({
      totalUsers: Number(tuple['total-users'].value),
      totalCheckins: Number(tuple['total-checkins'].value),
      totalChallenges: Number(tuple['total-challenges'].value),
      totalGroups: Number(tuple['total-groups'].value),
    })
  }, [callReadOnly])

// Fetch user profile, check-in eligibility, and latest note
  const refreshProfile = useCallback(async () => {
    if (!address) {
      setProfile({ streak: 0, bestStreak: 0, totalCheckins: 0, badgeLevel: 0, freezePasses: 0 })
      setCanCheckIn(false)
      setNextHeight(0)
      setLatestNote('')
      return
    }

    const principalArg = cvToHex(Cl.principal(address))

    const profileResponse = await callReadOnly('get-profile', [principalArg])
    const profileTuple = profileResponse.value.value
    setProfile({
      streak: Number(profileTuple.streak.value),
      bestStreak: Number(profileTuple['best-streak'].value),
      totalCheckins: Number(profileTuple['total-checkins'].value),
      badgeLevel: Number(profileTuple['badge-level'].value),
      freezePasses: Number(profileTuple['freeze-passes'].value),
    })

    const canCheckResponse = await callReadOnly('can-check-in', [principalArg])
    setCanCheckIn(Boolean(canCheckResponse.value))

    const nextHeightResponse = await callReadOnly('next-checkin-height', [principalArg])
    setNextHeight(Number(nextHeightResponse.value))

    const noteResponse = await callReadOnly('get-latest-note', [principalArg])
    if (noteResponse.value.type === 'some') {
      setLatestNote(String(noteResponse.value.value.value))
    } else {
      setLatestNote('')
    }
  }, [address, callReadOnly])

  const refreshChallenge = useCallback(async () => {
    const id = Number(challengeLookupId)
    if (!Number.isFinite(id) || id <= 0) {
      setChallenge(null)
      return
    }

    const challengeResponse = await callReadOnly('get-challenge', [cvToHex(Cl.uint(id))])
    if (challengeResponse.value.type === 'none') {
      setChallenge(null)
      return
    }

    const tuple = challengeResponse.value.value.value
    let joined = false
    let submissions = 0

    if (address) {
      const principalArg = cvToHex(Cl.principal(address))
      const joinedResponse = await callReadOnly('has-joined-challenge', [cvToHex(Cl.uint(id)), principalArg])
      const submissionsResponse = await callReadOnly('get-challenge-submissions', [cvToHex(Cl.uint(id)), principalArg])
      joined = Boolean(joinedResponse.value)
      submissions = Number(submissionsResponse.value)
    }

    setChallenge({
      id,
      title: String(tuple.title.value),
      active: Boolean(tuple.active.value),
      participants: Number(tuple.participants.value),
      startHeight: Number(tuple['start-height'].value),
      endHeight: Number(tuple['end-height'].value),
      joined,
      submissions,
    })
  }, [address, callReadOnly, challengeLookupId])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    try {
      await refreshStats()
      await refreshProfile()
      await refreshChallenge()
      setStatus('State refreshed from chain')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to refresh state')
    } finally {
      setLoading(false)
    }
  }, [refreshChallenge, refreshProfile, refreshStats])

  useEffect(() => {
    const cached = localStorage.getItem('streak-address')
    if (cached && isConnected()) {
      setAddress(cached)
    }
  }, [])

  useEffect(() => {
    refreshAll().catch(() => undefined)
  }, [refreshAll])

  const onConnect = async () => {
    try {
      const response = await connect()
      const walletAddress = response.addresses[0].address
      setAddress(walletAddress)
      localStorage.setItem('streak-address', walletAddress)
      setStatus('Wallet connected')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Wallet connection failed')
    }
  }

  const onDisconnect = () => {
    disconnect()
    localStorage.removeItem('streak-address')
    setAddress('')
    setStatus('Wallet disconnected')
  }

  const onCheckIn = async () => {
    if (!address) {
      setStatus('Connect a wallet first')
      return
    }

    setSubmitting(true)
    try {
      const noteArg = dailyNote.trim() ? Cl.some(Cl.stringUtf8(dailyNote.trim())) : Cl.none()
      const response = await callTx('check-in-with-note', [noteArg])

      setStatus(`Check-in submitted: ${response.txid}`)
      setDailyNote('')
      await refreshAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Check-in failed')
    } finally {
      setSubmitting(false)
    }
  }

  const onUseFreezePass = async () => {
    if (!address) return
    setSubmitting(true)
    try {
      const response = await callTx('use-freeze-pass', [])
      setStatus(`Freeze pass used: ${response.txid}`)
      await refreshAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Freeze pass failed')
    } finally {
      setSubmitting(false)
    }
  }

  const onCreateChallenge = async () => {
    if (!address) return
    const start = Number(challengeStart)
    const end = Number(challengeEnd)
    if (!challengeTitle.trim() || !Number.isFinite(start) || !Number.isFinite(end)) {
      setStatus('Provide challenge title, start and end heights')
      return
    }
    setSubmitting(true)
    try {
      const response = await callTx('create-challenge', [
        Cl.stringUtf8(challengeTitle.trim()),
        Cl.uint(start),
        Cl.uint(end),
      ])
      setStatus(`Challenge created: ${response.txid}`)
      await refreshAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Create challenge failed')
    } finally {
      setSubmitting(false)
    }
  }

  const onJoinChallenge = async () => {
    if (!address) return
    const id = Number(challengeLookupId)
    if (!Number.isFinite(id) || id <= 0) return
    setSubmitting(true)
    try {
      const response = await callTx('join-challenge', [Cl.uint(id)])
      setStatus(`Joined challenge ${id}: ${response.txid}`)
      await refreshAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Join challenge failed')
    } finally {
      setSubmitting(false)
    }
  }

  const onSubmitChallengeCheckin = async () => {
    if (!address) return
    const id = Number(challengeLookupId)
    if (!Number.isFinite(id) || id <= 0) return
    setSubmitting(true)
    try {
      const noteArg = challengeNote.trim() ? Cl.some(Cl.stringUtf8(challengeNote.trim())) : Cl.none()
      const response = await callTx('submit-challenge-checkin', [Cl.uint(id), noteArg])
      setStatus(`Challenge check-in submitted: ${response.txid}`)
      setChallengeNote('')
      await refreshAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Challenge submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const onAddFriend = async () => {
    if (!address || !friendPrincipal.trim()) return
    setSubmitting(true)
    try {
      const response = await callTx('add-friend', [Cl.principal(friendPrincipal.trim())])
      setStatus(`Friend added: ${response.txid}`)
      setFriendPrincipal('')
      await refreshAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Add friend failed')
    } finally {
      setSubmitting(false)
    }
  }

  const onCreateGroup = async () => {
    if (!address || !groupName.trim()) return
    const maxMembers = Number(groupMaxMembers)
    if (!Number.isFinite(maxMembers) || maxMembers < 2) {
      setStatus('Group max-members must be >= 2')
      return
    }
    setSubmitting(true)
    try {
      const response = await callTx('create-group', [Cl.stringUtf8(groupName.trim()), Cl.uint(maxMembers)])
      setStatus(`Group created: ${response.txid}`)
      setGroupName('')
      await refreshAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Create group failed')
    } finally {
      setSubmitting(false)
    }
  }

  const onJoinGroup = async () => {
    if (!address) return
    const id = Number(joinGroupId)
    if (!Number.isFinite(id) || id <= 0) return
    setSubmitting(true)
    try {
      const response = await callTx('join-group', [Cl.uint(id)])
      setStatus(`Joined group ${id}: ${response.txid}`)
      await refreshAll()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Join group failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="page">
      <header className="hero card">
        <div>
          <p className="eyebrow">On-chain Habit Loop</p>
          <h1>Daily Check-In Streaks</h1>
          <p className="muted">Track momentum publicly on Stacks with one check-in transaction per day.</p>
        </div>
        <div className="meta-grid">
          <div>
            <span className="meta-label">Contract</span>
            <p className="meta-value">{contractId}</p>
          </div>
          <div>
            <span className="meta-label">Network</span>
            <p className="meta-value">{NETWORK}</p>
          </div>
          <div>
            <span className="meta-label">Status</span>
            <p className="meta-value">{loading ? 'Refreshing' : submitting ? 'Submitting tx' : 'Live'}</p>
          </div>
        </div>
      </header>

      {!isWalletConnected ? (
        <>
          <section className="card connect-gate">
            <h2>UI Locked: Connect Wallet To Enter</h2>
            <p className="muted">
              The full dashboard, challenge tools, and social actions are hidden until a wallet is connected.
            </p>
            <div className="row">
              <button onClick={onConnect}>Connect Wallet</button>
              <button className="button-secondary" onClick={refreshAll} disabled={loading}>
                Refresh Network State
              </button>
            </div>
          </section>

          <footer className="card status-card">
            <p>{status}</p>
          </footer>
        </>
      ) : (
        <>
          <section className="grid">
            <article className="card section-card">
              <h2>Wallet</h2>
              <p className="address">{shortAddress}</p>
              <p className="muted small">{address || 'Connect to submit check-ins.'}</p>
              <div className="row">
                {!address ? (
                  <button onClick={onConnect}>Connect Wallet</button>
                ) : (
                  <button className="button-secondary" onClick={onDisconnect}>
                    Disconnect
                  </button>
                )}
                <button className="button-secondary" onClick={refreshAll} disabled={loading || submitting}>
                  Refresh
                </button>
              </div>
            </article>

            <article className="card section-card">
              <h2>Your Streak</h2>
              <div className="stat-grid">
                <div className="stat">
                  <span>Current</span>
                  <strong>{profile.streak}</strong>
                </div>
                <div className="stat">
                  <span>Best</span>
                  <strong>{profile.bestStreak}</strong>
                </div>
                <div className="stat">
                  <span>Total</span>
                  <strong>{profile.totalCheckins}</strong>
                </div>
                <div className="stat">
                  <span>Badge level</span>
                  <strong>{profile.badgeLevel}</strong>
                </div>
                <div className="stat">
                  <span>Freeze passes</span>
                  <strong>{profile.freezePasses}</strong>
                </div>
              </div>
              <ul className="list-clean">
                <li>Can check in: {canCheckIn ? 'Yes' : 'No'}</li>
                <li>Next eligible height: {nextHeight}</li>
              </ul>
              <textarea
                className="note-input"
                placeholder="Optional proof note for today"
                value={dailyNote}
                onChange={(e) => setDailyNote(e.target.value.slice(0, 140))}
              />
              <p className="muted small">Latest note: {latestNote || 'none'}</p>
              <button onClick={onCheckIn} disabled={!address || !canCheckIn || submitting}>
                {submitting ? 'Submitting...' : 'Check In'}
              </button>
              <button
                className="button-secondary"
                onClick={onUseFreezePass}
                disabled={!address || profile.freezePasses < 1 || submitting}
              >
                Use Freeze Pass
              </button>
            </article>

            <article className="card section-card">
              <h2>Global Activity</h2>
              <div className="stat-grid single">
                <div className="stat">
                  <span>Total users</span>
                  <strong>{stats.totalUsers}</strong>
                </div>
                <div className="stat">
                  <span>Total check-ins</span>
                  <strong>{stats.totalCheckins}</strong>
                </div>
                <div className="stat">
                  <span>Total challenges</span>
                  <strong>{stats.totalChallenges}</strong>
                </div>
                <div className="stat">
                  <span>Total groups</span>
                  <strong>{stats.totalGroups}</strong>
                </div>
              </div>
              <p className="muted small">These metrics are read directly from the contract state.</p>
            </article>
          </section>

          <section className="grid feature-grid">
            <article className="card section-card">
              <h2>Challenges</h2>
              <div className="stack">
                <input
                  placeholder="Challenge title"
                  value={challengeTitle}
                  onChange={(e) => setChallengeTitle(e.target.value)}
                />
                <input
                  placeholder="Start height"
                  value={challengeStart}
                  onChange={(e) => setChallengeStart(e.target.value)}
                />
                <input
                  placeholder="End height"
                  value={challengeEnd}
                  onChange={(e) => setChallengeEnd(e.target.value)}
                />
                <button onClick={onCreateChallenge} disabled={!address || submitting}>
                  Create Challenge
                </button>
              </div>

              <div className="stack separator-top">
                <input
                  placeholder="Challenge id"
                  value={challengeLookupId}
                  onChange={(e) => setChallengeLookupId(e.target.value)}
                />
                <button className="button-secondary" onClick={refreshChallenge} disabled={loading || submitting}>
                  Load Challenge
                </button>
                <button className="button-secondary" onClick={onJoinChallenge} disabled={!address || submitting}>
                  Join Challenge
                </button>
                <textarea
                  className="note-input"
                  placeholder="Challenge submission note"
                  value={challengeNote}
                  onChange={(e) => setChallengeNote(e.target.value.slice(0, 140))}
                />
                <button onClick={onSubmitChallengeCheckin} disabled={!address || submitting}>
                  Submit Challenge Check-in
                </button>
              </div>

              {challenge ? (
                <ul className="list-clean">
                  <li>
                    #{challenge.id} {challenge.title}
                  </li>
                  <li>Active: {challenge.active ? 'Yes' : 'No'}</li>
                  <li>Participants: {challenge.participants}</li>
                  <li>
                    Window: {challenge.startHeight} - {challenge.endHeight}
                  </li>
                  <li>You joined: {challenge.joined ? 'Yes' : 'No'}</li>
                  <li>Your submissions: {challenge.submissions}</li>
                </ul>
              ) : (
                <p className="muted small">Load a challenge id to view details.</p>
              )}
            </article>

            <article className="card section-card">
              <h2>Social</h2>
              <div className="stack">
                <input
                  placeholder="Friend principal"
                  value={friendPrincipal}
                  onChange={(e) => setFriendPrincipal(e.target.value)}
                />
                <button className="button-secondary" onClick={onAddFriend} disabled={!address || submitting}>
                  Add Friend
                </button>
              </div>

              <div className="stack separator-top">
                <input placeholder="Group name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                <input
                  placeholder="Max members"
                  value={groupMaxMembers}
                  onChange={(e) => setGroupMaxMembers(e.target.value)}
                />
                <button className="button-secondary" onClick={onCreateGroup} disabled={!address || submitting}>
                  Create Group
                </button>
              </div>

              <div className="stack separator-top">
                <input placeholder="Join group id" value={joinGroupId} onChange={(e) => setJoinGroupId(e.target.value)} />
                <button className="button-secondary" onClick={onJoinGroup} disabled={!address || submitting}>
                  Join Group
                </button>
              </div>
            </article>
          </section>

          <footer className="card status-card">
            <p>{status}</p>
          </footer>
        </>
      )}
    </main>
  )
}

export default App
