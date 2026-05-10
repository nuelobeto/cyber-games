/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import api from "@/services"
import { ISession } from "@/types"
import { IPlayer } from "@/types"
import { useEffect, useState } from "react"

export const useSession = (session_id: string) => {
  const [session, setSession] = useState<ISession | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!session_id) {
      setSession(null)
      setHasLoaded(true)
      return
    }

    setHasLoaded(false)

    const unsubscribe = api.getSessionById(session_id, (updatedSession) => {
      setSession(updatedSession)
      setHasLoaded(true)
    })

    return () => unsubscribe()
  }, [session_id])

  return {
    data: session,
    isLoading: Boolean(session_id) && !hasLoaded,
  }
}

export const usePlayer = (player_id: string) => {
  const [player, setPlayer] = useState<IPlayer | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!player_id) {
      setPlayer(null)
      setHasLoaded(true)
      return
    }

    setHasLoaded(false)

    const unsubscribe = api.getPlayerById(player_id, (updatedPlayer) => {
      setPlayer(updatedPlayer)
      setHasLoaded(true)
    })

    return () => unsubscribe()
  }, [player_id])

  return {
    data: player,
    isLoading: Boolean(player_id) && !hasLoaded,
  }
}

export const usePlayersBySession = (session_id: string) => {
  const [players, setPlayers] = useState<IPlayer[]>([])
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!session_id) {
      setPlayers([])
      setHasLoaded(true)
      return
    }

    setHasLoaded(false)

    const unsubscribe = api.getPlayersBySessionId(session_id, (players) => {
      setPlayers(players)
      setHasLoaded(true)
    })

    return () => unsubscribe()
  }, [session_id])

  return {
    data: players,
    isLoading: Boolean(session_id) && !hasLoaded,
  }
}
