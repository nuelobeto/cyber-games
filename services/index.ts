import {
  equalTo,
  get,
  increment,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  set,
  update,
} from "firebase/database"
import { database } from "@/lib/firebase"
import {
  ICreateSession,
  IJoinSession,
  IPlayer,
  ISession,
  IUpdatePlayer,
  IUpdateSessionStatus,
} from "@/types"

const generateJoinCode = () => {
  return Math.floor(100000 + Math.random() * 900000)
}

const createSession = async (payload: ICreateSession): Promise<ISession> => {
  const sessionRef = push(ref(database, "sessions"))
  const sessionId = sessionRef.key

  if (!sessionId) {
    throw new Error("Unable to create session")
  }

  const createdAt = new Date()

  const session: ISession = {
    id: sessionId,
    created_at: createdAt.toISOString(),
    duration_in_minutes: payload.duration_in_minutes,
    number_of_participants: 0,
    join_code: generateJoinCode(),
    status: "waiting",
  }

  await set(sessionRef, session)

  await set(ref(database, `session_codes/${session.join_code}`), sessionId)

  if (typeof window !== "undefined") {
    localStorage.setItem("session_id", JSON.stringify(sessionId))
  }

  return session
}

const joinSession = async (payload: IJoinSession): Promise<IPlayer> => {
  const codeRef = ref(database, `session_codes/${payload.join_code}`)
  const codeSnapshot = await get(codeRef)

  if (!codeSnapshot.exists()) {
    throw new Error("Invalid session code")
  }

  const sessionId = codeSnapshot.val() as string

  const sessionRef = ref(database, `sessions/${sessionId}`)
  const sessionSnapshot = await get(sessionRef)

  if (!sessionSnapshot.exists()) {
    throw new Error("Session not found")
  }

  const session = sessionSnapshot.val() as ISession

  if (session.status === "ended") {
    throw new Error("This session has ended")
  }

  if (session.status === "active") {
    if (!session.started_at) {
      throw new Error("Active session is missing start time")
    }

    const startedAt = new Date(session.started_at)

    const endsAt = new Date(
      startedAt.getTime() + session.duration_in_minutes * 60 * 1000
    )

    if (new Date() > endsAt) {
      await update(sessionRef, {
        status: "ended",
      })

      throw new Error("This session has expired")
    }
  }

  const playerRef = push(ref(database, "players"))
  const playerId = playerRef.key

  if (!playerId) {
    throw new Error("Unable to join session")
  }

  const player: IPlayer = {
    id: playerId,
    session_id: sessionId,
    score: 0,
    games_completed: [],
  }

  await set(playerRef, player)

  await update(sessionRef, {
    number_of_participants: increment(1),
  })

  if (typeof window !== "undefined") {
    localStorage.setItem("session_id", JSON.stringify(sessionId))
    localStorage.setItem("player_id", JSON.stringify(playerId))
  }

  return player
}

const getSessionById = (
  session_id: string,
  callback: (session: ISession | null) => void
) => {
  if (!session_id) {
    throw new Error("Session ID is required")
  }

  const sessionRef = ref(database, `sessions/${session_id}`)

  const unsubscribe = onValue(sessionRef, (snapshot) => {
    if (!snapshot.exists()) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("session")
      }

      callback(null)
      return
    }

    const session = snapshot.val() as ISession

    if (typeof window !== "undefined") {
      localStorage.setItem("session_id", JSON.stringify(session_id))
    }

    callback(session)
  })

  return unsubscribe
}

const getSessionByCode = async (join_code: number): Promise<ISession> => {
  const codeRef = ref(database, `session_codes/${join_code}`)
  const codeSnapshot = await get(codeRef)

  if (!codeSnapshot.exists()) {
    throw new Error("Invalid session code")
  }

  const sessionId = codeSnapshot.val() as string

  const sessionRef = ref(database, `sessions/${sessionId}`)
  const sessionSnapshot = await get(sessionRef)

  if (!sessionSnapshot.exists()) {
    throw new Error("Session not found")
  }

  return sessionSnapshot.val() as ISession
}

const updateSessionStatus = async (
  payload: IUpdateSessionStatus
): Promise<void> => {
  const { session_id, status } = payload

  if (!session_id) {
    throw new Error("Session ID is required")
  }

  const sessionRef = ref(database, `sessions/${session_id}`)

  const updates: Partial<ISession> = {
    status,
  }

  if (status === "active") {
    updates.started_at = new Date().toISOString()
  }

  await update(sessionRef, updates)
}

const getPlayerById = (
  player_id: string,
  callback: (player: IPlayer | null) => void
) => {
  if (!player_id) {
    throw new Error("Player ID is required")
  }

  const playerRef = ref(database, `players/${player_id}`)

  const unsubscribe = onValue(playerRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null)
      return
    }

    callback(snapshot.val() as IPlayer)
  })

  return unsubscribe
}

const updatePlayer = async (payload: IUpdatePlayer): Promise<IPlayer> => {
  const { player_id, ...updates } = payload

  if (!player_id) {
    throw new Error("Player ID is required")
  }

  const playerRef = ref(database, `players/${player_id}`)
  const playerSnapshot = await get(playerRef)

  if (!playerSnapshot.exists()) {
    throw new Error("Player not found")
  }

  const currentPlayer = playerSnapshot.val() as IPlayer

  if (updates.username) {
    const nextUsername = updates.username.trim()

    if (!nextUsername) {
      throw new Error("Username is required")
    }

    const playersRef = ref(database, "players")

    const playersQuery = query(
      playersRef,
      orderByChild("session_id"),
      equalTo(currentPlayer.session_id)
    )

    const playersSnapshot = await get(playersQuery)

    if (playersSnapshot.exists()) {
      const players = playersSnapshot.val() as Record<string, IPlayer>

      const usernameAlreadyExists = Object.values(players).some((player) => {
        const isSamePlayer = player.id === player_id

        const existingUsername = player.username?.trim().toLowerCase()
        const newUsername = nextUsername.toLowerCase()

        return !isSamePlayer && existingUsername === newUsername
      })

      if (usernameAlreadyExists) {
        throw new Error("This username is already taken in this session")
      }
    }

    updates.username = nextUsername
  }

  const updatedPlayer: IPlayer = {
    ...currentPlayer,
    ...updates,
  }

  await update(playerRef, updates)

  return updatedPlayer
}

const getPlayersBySessionId = (
  session_id: string,
  callback: (players: IPlayer[]) => void
) => {
  if (!session_id) {
    throw new Error("Session ID is required")
  }

  const playersRef = ref(database, "players")

  const playersQuery = query(
    playersRef,
    orderByChild("session_id"),
    equalTo(session_id)
  )

  const unsubscribe = onValue(playersQuery, (snapshot) => {
    if (!snapshot.exists()) {
      callback([])
      return
    }

    const playersData = snapshot.val() as Record<string, IPlayer>
    const players = Object.values(playersData)

    callback(players)
  })

  return unsubscribe
}

const api = {
  createSession,
  joinSession,
  getSessionById,
  getSessionByCode,
  updateSessionStatus,
  getPlayerById,
  updatePlayer,
  getPlayersBySessionId,
}

export default api
