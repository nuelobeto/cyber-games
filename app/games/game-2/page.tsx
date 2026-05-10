"use client"

import { Dashboard } from "@/components/layout/dashboard"
import { Button } from "@/components/ui/button"
import { usePlayer } from "@/hooks/useSubscriptions"
import { useUpdatePlayerMutation } from "@/hooks/useMutation"
import { GAME_LINKS, ROUTES, TOTAL_GAMES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { IUpdatePlayer } from "@/types"
import { GripVertical } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { MoveToNextGame } from "@/components/features/move-to-next-game"
import { GameInfo } from "@/components/features/game-info"

const GAME_ID = "game-2"
const GAME_MAX_SCORE = 10

type TimelineStage = {
  id: string
  label: string
  description: string
}

const CORRECT_TIMELINE: TimelineStage[] = [
  {
    id: "reconnaissance",
    label: "Reconnaissance",
    description: "The attacker gathers information about the target.",
  },
  {
    id: "scanning-enumeration",
    label: "Scanning and Enumeration",
    description: "The attacker looks for open ports, services, and weaknesses.",
  },
  {
    id: "gaining-access",
    label: "Gaining Access",
    description: "The attacker exploits a weakness to enter the system.",
  },
  {
    id: "privilege-escalation",
    label: "Privilege Escalation",
    description: "The attacker tries to gain higher-level access.",
  },
  {
    id: "maintaining-access",
    label: "Maintaining Access",
    description: "The attacker creates a way to return later.",
  },
  {
    id: "covering-tracks",
    label: "Covering Tracks",
    description: "The attacker hides evidence of their activity.",
  },
  {
    id: "exfiltration",
    label: "Exfiltration",
    description: "The attacker steals or moves data out of the system.",
  },
]

const SHUFFLED_TIMELINE: TimelineStage[] = [
  CORRECT_TIMELINE[2],
  CORRECT_TIMELINE[0],
  CORRECT_TIMELINE[5],
  CORRECT_TIMELINE[1],
  CORRECT_TIMELINE[6],
  CORRECT_TIMELINE[3],
  CORRECT_TIMELINE[4],
]

export default function Game2() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const sessionId = searchParams.get("sessionId") ?? ""
  const playerId = searchParams.get("playerId") ?? ""

  const { data: player } = usePlayer(playerId)

  const { mutate: updatePlayer } = useUpdatePlayerMutation()

  const [showInfo, setShowInfo] = useState(true)
  const [timeline, setTimeline] = useState<TimelineStage[]>(SHUFFLED_TIMELINE)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const hasPlayedGame = player?.games_completed?.includes(GAME_ID)

  const pathname = usePathname()

  const currentGame = GAME_LINKS.find((game) => game.href === pathname)

  const gameName = currentGame?.label ?? "Cyber Games"

  const correctPositions = useMemo(() => {
    return timeline.filter((stage, index) => {
      return stage.id === CORRECT_TIMELINE[index].id
    }).length
  }, [timeline])

  function moveStage(fromIndex: number, direction: "up" | "down") {
    if (hasSubmitted) return

    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1

    if (toIndex < 0 || toIndex >= timeline.length) return

    const updatedTimeline = [...timeline]
    const currentStage = updatedTimeline[fromIndex]
    const targetStage = updatedTimeline[toIndex]

    updatedTimeline[fromIndex] = targetStage
    updatedTimeline[toIndex] = currentStage

    setTimeline(updatedTimeline)
    setSelectedIndex(toIndex)
  }

  function handleSubmitTimeline() {
    const earnedScore =
      (correctPositions / CORRECT_TIMELINE.length) * GAME_MAX_SCORE

    setHasSubmitted(true)

    if (!player?.id) {
      toast.error("Player not found.")
      return
    }

    const currentCompletedGames = player.games_completed ?? []
    const hasCompletedGame = currentCompletedGames.includes(GAME_ID)

    const updatedCompletedGames = hasCompletedGame
      ? currentCompletedGames
      : [...currentCompletedGames, GAME_ID]

    const payload: IUpdatePlayer = {
      player_id: player.id,
      score: (player.score ?? 0) + earnedScore,
      games_completed: updatedCompletedGames,
    }

    updatePlayer(payload, {
      onSuccess: () => {
        toast.success("Game score saved.")

        const nextGame = GAME_LINKS.find(
          (game) => !updatedCompletedGames.includes(game.id)
        )

        if (!nextGame || updatedCompletedGames.length >= TOTAL_GAMES) {
          router.replace(
            `${ROUTES.leader_board}?sessionId=${sessionId}&playerId=${player.id}`
          )
          return
        }

        router.replace(
          `${nextGame.href}?sessionId=${sessionId}&playerId=${player.id}`
        )
      },
    })
  }

  return (
    <Dashboard>
      {hasPlayedGame ? (
        <MoveToNextGame completedGameId={GAME_ID} />
      ) : showInfo ? (
        <GameInfo
          setOpen={setShowInfo}
          gameName={gameName}
          gameInfo="Put the stages of a cyber attack in the correct order. This game
            helps you understand how attackers usually move from gathering
            information to stealing data."
        />
      ) : (
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-widest text-primary uppercase">
                {GAME_ID}
              </p>
              <h1 className="text-xl font-bold">{gameName}</h1>
            </div>

            <div className="rounded-xl border bg-background px-3 py-2 text-right">
              <p className="text-xs text-muted-foreground">Correct</p>
              <p className="text-lg font-bold">
                {correctPositions}/{CORRECT_TIMELINE.length}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Reorder the attack stages from first to last. Select a card, then
            move it up or down.
          </p>

          <div className="mt-5 space-y-2">
            {timeline.map((stage, index) => {
              const isSelected = selectedIndex === index

              return (
                <div
                  key={stage.id}
                  className={cn(
                    "rounded-2xl border bg-background p-3",
                    isSelected && "border-primary bg-primary/10"
                  )}
                >
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 text-left"
                    onClick={() => setSelectedIndex(index)}
                  >
                    <div className="mt-1 text-muted-foreground">
                      <GripVertical className="size-4" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="font-semibold">
                          {index + 1}. {stage.label}
                        </h2>
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {stage.description}
                      </p>
                    </div>
                  </button>

                  {isSelected && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={index === 0}
                        onClick={() => moveStage(index, "up")}
                      >
                        Move Up
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={index === timeline.length - 1}
                        onClick={() => moveStage(index, "down")}
                      >
                        Move Down
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <Button
            size="lg"
            className="mt-6 w-full"
            onClick={handleSubmitTimeline}
          >
            Submit Timeline
          </Button>
        </div>
      )}
    </Dashboard>
  )
}
