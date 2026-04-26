export type Stats = {
  totalUsers: number
  totalCheckins: number
  totalChallenges: number
  totalGroups: number
}

export type Profile = {
  streak: number
  bestStreak: number
  totalCheckins: number
  badgeLevel: number
  freezePasses: number
}

export type ChallengeDetails = {
  id: number
  title: string
  active: boolean
  participants: number
  startHeight: number
  endHeight: number
  joined: boolean
  submissions: number
}
