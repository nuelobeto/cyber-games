"use client"

import { Button } from "@/components/ui/button"
import { GAME_LINKS, ROUTES, TOTAL_GAMES } from "@/lib/constants"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface Props {
  completedGameId: string
}

export const MoveToNextGame = ({ completedGameId }: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const sessionId = searchParams.get("sessionId") ?? ""
  const playerId = searchParams.get("playerId") ?? ""

  const currentGameIndex = GAME_LINKS.findIndex(
    (game) => game.id === completedGameId
  )

  const nextGameNumber = currentGameIndex + 2
  const nextGame =
    nextGameNumber <= TOTAL_GAMES ? GAME_LINKS[currentGameIndex + 1] : null

  const handleContinue = () => {
    if (nextGame) {
      router.replace(
        `${nextGame.href}?sessionId=${sessionId}&playerId=${playerId}`
      )
      return
    }

    router.replace(
      `${ROUTES.leader_board}?sessionId=${sessionId}&playerId=${playerId}`
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-4 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle2 className="size-7 text-primary" />
      </div>

      <h2 className="mt-4 text-xl font-bold">Game already completed</h2>

      <p className="mt-2 text-sm text-muted-foreground">
        You have already played this game. Move on to the next challenge to keep
        progressing.
      </p>

      <Button className="mt-6 w-full" onClick={handleContinue}>
        {nextGame ? `Go to ${nextGame.label}` : "View Leaderboard"}
        <ArrowRight className="ml-2 size-4" />
      </Button>
    </div>
  )
}
