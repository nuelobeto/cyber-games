export type TSessionStatus = "waiting" | "active" | "ended"

export interface ICreateSession {
  duration_in_minutes: number
}

export interface ISession {
  id: string
  created_at: string
  started_at?: string
  duration_in_minutes: number
  number_of_participants: number
  join_code: number
  status: TSessionStatus
}

export interface IUpdateSessionStatus {
  session_id: string
  status: TSessionStatus
}

export interface IJoinSession {
  join_code: number
}

export interface IPlayer {
  id: string
  session_id: string
  username?: string
  avatar?: string
  score: number
  games_completed: string[]
}

export interface IUpdatePlayer {
  player_id: string
  username?: string
  avatar?: string
  score?: number
  games_completed?: string[]
}
