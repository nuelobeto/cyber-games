/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { Dashboard } from "@/components/layout/dashboard"
import { GameInfo } from "@/components/features/game-info"
import { MoveToNextGame } from "@/components/features/move-to-next-game"
import { Button } from "@/components/ui/button"
import { usePlayer } from "@/hooks/useSubscriptions"
import { useUpdatePlayerMutation } from "@/hooks/useMutation"
import { FIRST_AVATAR, GAME_LINKS, ROUTES, TOTAL_GAMES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { IUpdatePlayer } from "@/types"
import { ShieldCheck, Skull, ArrowLeft, ArrowRight } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const GAME_ID = "game-10"
const GAME_MAX_SCORE = 10
const TOTAL_ROUNDS = 10

type Lane = "left" | "right"
type FallingItemType = "attack" | "control"

type FallingItem = {
  id: string
  label: string
  type: FallingItemType
  lane: Lane
  explanation: string
}

const ITEMS: Omit<FallingItem, "id" | "lane">[] = [
  {
    label: "Phishing",
    type: "attack",
    explanation:
      "Phishing is an attack where users are tricked into revealing sensitive information.",
  },
  {
    label: "SQL Injection",
    type: "attack",
    explanation:
      "SQL Injection is an attack where malicious input changes how a database query behaves.",
  },
  {
    label: "Brute Force",
    type: "attack",
    explanation:
      "Brute force attacks repeatedly guess passwords or credentials.",
  },
  {
    label: "Ransomware",
    type: "attack",
    explanation: "Ransomware can encrypt data and disrupt availability.",
  },
  {
    label: "MITM",
    type: "attack",
    explanation:
      "Man-in-the-Middle attacks try to intercept communication between parties.",
  },
  {
    label: "Firewall",
    type: "control",
    explanation:
      "Firewalls are technical controls that help prevent unwanted network traffic.",
  },
  {
    label: "MFA",
    type: "control",
    explanation:
      "Multi-Factor Authentication helps protect accounts from credential theft.",
  },
  {
    label: "Encryption",
    type: "control",
    explanation:
      "Encryption protects sensitive data from unauthorized reading.",
  },
  {
    label: "Backups",
    type: "control",
    explanation:
      "Backups help recovery after incidents such as ransomware or data loss.",
  },
  {
    label: "IDS/IPS",
    type: "control",
    explanation: "IDS/IPS helps detect or prevent suspicious network activity.",
  },
]

const LANES: Lane[] = ["left", "right"]

const getRandomLane = (): Lane => {
  return LANES[Math.floor(Math.random() * LANES.length)]
}

const getRoundItem = (roundIndex: number): FallingItem => {
  const item = ITEMS[roundIndex % ITEMS.length]

  return {
    ...item,
    id: `${GAME_ID}-round-${roundIndex + 1}`,
    lane: getRandomLane(),
  }
}

export default function Game10() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const sessionId = searchParams.get("sessionId") ?? ""
  const playerId = searchParams.get("playerId") ?? ""

  const { data: player } = usePlayer(playerId)
  const { mutate: updatePlayer } = useUpdatePlayerMutation()

  const [showInfo, setShowInfo] = useState(true)
  const [roundIndex, setRoundIndex] = useState(0)
  const [playerLane, setPlayerLane] = useState<Lane>("left")
  const [currentItem, setCurrentItem] = useState<FallingItem>(() =>
    getRoundItem(0)
  )
  const [position, setPosition] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [correctMoves, setCorrectMoves] = useState(0)

  const hasPlayedGame = player?.games_completed?.includes(GAME_ID)

  const avatar = player?.avatar || FIRST_AVATAR

  const username = player?.username || "Player"

  const pointsPerRound = GAME_MAX_SCORE / TOTAL_ROUNDS

  const pathname = usePathname()

  const currentGame = GAME_LINKS.find((game) => game.href === pathname)

  const gameName = currentGame?.label ?? "Cyber Games"

  const progress = useMemo(() => {
    return Math.round(((roundIndex + 1) / TOTAL_ROUNDS) * 100)
  }, [roundIndex])

  const moveToNextGame = useCallback(
    (updatedCompletedGames: string[]) => {
      const nextGame = GAME_LINKS.find(
        (game) => !updatedCompletedGames.includes(game.id)
      )

      if (!nextGame || updatedCompletedGames.length >= TOTAL_GAMES) {
        router.replace(
          `${ROUTES.leader_board}?sessionId=${sessionId}&playerId=${player?.id}`
        )
        return
      }

      router.replace(
        `${nextGame.href}?sessionId=${sessionId}&playerId=${player?.id}`
      )
    },
    [player?.id, router, sessionId]
  )

  const completeGame = useCallback(
    (finalCorrectMoves: number) => {
      if (!player?.id) return

      const earnedScore = finalCorrectMoves * pointsPerRound

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
          moveToNextGame(updatedCompletedGames)
        },
      })
    },
    [moveToNextGame, player, pointsPerRound, updatePlayer]
  )

  const resolveRound = useCallback(() => {
    if (isLocked) return

    setIsLocked(true)

    const playerTouchesItem = playerLane === currentItem.lane

    const isCorrectMove =
      currentItem.type === "attack" ? !playerTouchesItem : playerTouchesItem

    const nextCorrectMoves = correctMoves + (isCorrectMove ? 1 : 0)

    if (isCorrectMove) {
      setCorrectMoves(nextCorrectMoves)
    }

    setTimeout(() => {
      const isLastRound = roundIndex === TOTAL_ROUNDS - 1

      if (isLastRound) {
        completeGame(nextCorrectMoves)
        return
      }

      const nextRoundIndex = roundIndex + 1

      setRoundIndex(nextRoundIndex)
      setCurrentItem(getRoundItem(nextRoundIndex))
      setPosition(0)
      setIsLocked(false)
    }, 900)
  }, [
    completeGame,
    correctMoves,
    currentItem,
    isLocked,
    playerLane,
    roundIndex,
  ])

  useEffect(() => {
    if (showInfo) return
    if (hasPlayedGame) return
    if (isLocked) return

    const interval = window.setInterval(() => {
      setPosition((prev) => {
        if (prev >= 100) {
          return prev
        }

        return prev + 10
      })
    }, 180)

    return () => window.clearInterval(interval)
  }, [hasPlayedGame, isLocked, showInfo])

  useEffect(() => {
    if (position < 100) return

    resolveRound()
  }, [position, resolveRound])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        setPlayerLane("left")
      }

      if (event.key === "ArrowRight") {
        setPlayerLane("right")
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <Dashboard>
      {hasPlayedGame ? (
        <MoveToNextGame completedGameId={GAME_ID} />
      ) : showInfo ? (
        <GameInfo
          setOpen={setShowInfo}
          gameName={gameName}
          gameInfo="Move left or right to dodge cyber attacks and collect security controls. Do not hit attacks like phishing, ransomware, SQL injection, brute force, or MITM. Do not miss controls like firewalls, MFA, encryption, backups, and IDS/IPS."
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
                {correctMoves}/{TOTAL_ROUNDS}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
              <span>
                Round {roundIndex + 1} of {TOTAL_ROUNDS}
              </span>
              <span>{progress}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border bg-background p-4">
            <div className="grid grid-cols-2 rounded-xl bg-card">
              {LANES.map((lane) => {
                const itemIsInLane = currentItem.lane === lane
                const playerIsInLane = playerLane === lane

                return (
                  <div
                    key={lane}
                    className="relative h-[360px] overflow-hidden"
                  >
                    {itemIsInLane && (
                      <div
                        className={cn(
                          "absolute left-1/2 flex w-[84%] -translate-x-1/2 items-center gap-2 rounded-2xl border p-3 text-sm font-semibold transition-all",
                          currentItem.type === "attack"
                            ? "border-destructive bg-destructive/10 text-destructive"
                            : "border-primary bg-primary/10 text-primary"
                        )}
                        style={{ top: `${position}%` }}
                      >
                        {currentItem.type === "attack" ? (
                          <Skull className="size-4" />
                        ) : (
                          <ShieldCheck className="size-4" />
                        )}
                        <span>{currentItem.label}</span>
                      </div>
                    )}

                    <div
                      className={cn(
                        "absolute bottom-3 left-1/2 w-fit -translate-x-1/2",
                        playerIsInLane
                          ? "rounded-full border border-primary p-1"
                          : "opacity-0"
                      )}
                    >
                      <Avatar>
                        <AvatarImage src={avatar} />
                        <AvatarFallback>
                          {username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button
              size="lg"
              variant={playerLane === "left" ? "default" : "outline"}
              onClick={() => setPlayerLane("left")}
              disabled={isLocked}
            >
              <ArrowLeft className="mr-2 size-4" />
              Left
            </Button>

            <Button
              size="lg"
              variant={playerLane === "right" ? "default" : "outline"}
              onClick={() => setPlayerLane("right")}
              disabled={isLocked}
            >
              Right
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      )}
    </Dashboard>
  )
}
