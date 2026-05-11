"use client"

import { useSession } from "@/hooks/useSubscriptions"
import { ROUTES } from "@/lib/constants"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

interface Props {
  children: React.ReactNode
}

export const AppWrapper = ({ children }: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const sessionId = searchParams.get("sessionId") ?? ""

  const { data: session } = useSession(sessionId)

  useEffect(() => {
    if (!session) return

    if (session.status === "ended") {
      router.replace(`${ROUTES.leader_board}?sessionId=${sessionId}`)
    }
  }, [router, session, sessionId])

  return <>{children}</>
}
