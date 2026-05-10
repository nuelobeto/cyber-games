/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useSession } from "@/hooks/useSubscriptions"
import { ROUTES } from "@/lib/constants"
import api from "@/services"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Props {
  children: React.ReactNode
}

export const AppWrapper = ({ children }: Props) => {
  const router = useRouter()

  const [sessionId, setSessionId] = useState(() => {
    if (typeof window === "undefined") return ""

    const savedSessionId: string | null = localStorage.getItem("session_id")
    const _sessionId: string = savedSessionId ? JSON.parse(savedSessionId) : ""

    return _sessionId
  })

  const { data: session } = useSession(sessionId)

  useEffect(() => {
    if (!session) return

    if (session.status === "ended") {
      const endedSessionId = session.id

      setSessionId(endedSessionId)

      router.replace(`${ROUTES.leader_board}?sessionId=${endedSessionId}`)
    }
  }, [router, session])

  useEffect(() => {
    if (!session) return
    if (session.status !== "active") return
    if (!session.started_at) return

    const checkSessionTime = async () => {
      const startedAt = new Date(session.started_at as string)
      const endsAt = new Date(
        startedAt.getTime() + session.duration_in_minutes * 60 * 1000
      )

      const hasEnded = new Date() >= endsAt

      if (!hasEnded) return

      await api.updateSessionStatus({
        session_id: session.id,
        status: "ended",
      })
    }

    checkSessionTime()

    const interval = window.setInterval(() => {
      checkSessionTime()
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [session])

  return <>{children}</>
}
