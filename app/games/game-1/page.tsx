"use client"

import { GameInfo } from "@/components/features/game-info"
import { MoveToNextGame } from "@/components/features/move-to-next-game"
import { Dashboard } from "@/components/layout/dashboard"
import { Button } from "@/components/ui/button"
import { useUpdatePlayerMutation } from "@/hooks/useMutation"
import { usePlayer } from "@/hooks/useSubscriptions"
import { GAME_LINKS, ROUTES, TOTAL_GAMES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { IUpdatePlayer } from "@/types"
import { FilterIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

const GAME_ID = "game-1"
const GAME_MAX_SCORE = 10

const CATEGORIES = [
  "Devices",
  "Networks",
  "Applications",
  "Data",
  "People",
] as const

type Category = (typeof CATEGORIES)[number]

type Question = {
  id: string
  item: string
  correctCategory: Category
  explanation: string
}

const QUESTIONS: Question[] = [
  {
    id: "q1",
    item: "Phone",
    correctCategory: "Devices",
    explanation:
      "A phone is a device that needs protection from unauthorized access.",
  },
  {
    id: "q2",
    item: "Laptop",
    correctCategory: "Devices",
    explanation:
      "A laptop is an endpoint device that may store personal or business data.",
  },
  {
    id: "q3",
    item: "Wi-Fi",
    correctCategory: "Networks",
    explanation:
      "Wi-Fi belongs to network security because it connects devices together.",
  },
  {
    id: "q4",
    item: "Enterprise network",
    correctCategory: "Networks",
    explanation:
      "An enterprise network must be secured to protect communication between systems.",
  },
  {
    id: "q5",
    item: "Website",
    correctCategory: "Applications",
    explanation: "A website is an application that users interact with online.",
  },
  {
    id: "q6",
    item: "Mobile app",
    correctCategory: "Applications",
    explanation:
      "A mobile app is an application that needs secure design and protection.",
  },
  {
    id: "q7",
    item: "Password",
    correctCategory: "Data",
    explanation:
      "A password is sensitive data that must be protected from attackers.",
  },
  {
    id: "q8",
    item: "Personal information",
    correctCategory: "Data",
    explanation:
      "Personal information is valuable data that attackers may target.",
  },
  {
    id: "q9",
    item: "User account",
    correctCategory: "People",
    explanation:
      "A user account represents a person interacting with a system.",
  },
  {
    id: "q10",
    item: "Employee",
    correctCategory: "People",
    explanation:
      "People affect cybersecurity through choices, habits, mistakes, and awareness.",
  },
]

export default function Game1() {
  const [showInfo, setShowInfo] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  )
  const [isLocked, setIsLocked] = useState(false)
  const [score, setScore] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)

  const router = useRouter()
  const searchParams = useSearchParams()

  const sessionId = searchParams.get("sessionId") ?? ""
  const playerId = searchParams.get("playerId") ?? ""

  const { data: player } = usePlayer(playerId)
  const { mutate: updatePlayer } = useUpdatePlayerMutation()

  const hasPlayedGame = player?.games_completed?.includes(GAME_ID)

  const currentQuestion = QUESTIONS[currentQuestionIndex]
  const totalQuestions = QUESTIONS.length
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1

  const pointsPerQuestion = GAME_MAX_SCORE / totalQuestions

  const pathname = usePathname()

  const currentGame = GAME_LINKS.find((game) => game.href === pathname)

  const gameName = currentGame?.label ?? "Cyber Games"

  const progress = useMemo(() => {
    return Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)
  }, [currentQuestionIndex, totalQuestions])

  function handleSelectCategory(category: Category) {
    if (isLocked) return

    setSelectedCategory(category)
    setIsLocked(true)

    const isCorrect = category === currentQuestion.correctCategory

    const earnedPoints = isCorrect ? pointsPerQuestion : 0
    const nextLocalScore = score + earnedPoints
    const nextCorrectAnswers = correctAnswers + (isCorrect ? 1 : 0)

    setScore(nextLocalScore)
    setCorrectAnswers(nextCorrectAnswers)

    if (player?.id) {
      const currentCompletedGames = player.games_completed ?? []
      const hasCompletedGame = currentCompletedGames.includes(GAME_ID)

      const nextCompletedGames =
        isLastQuestion && !hasCompletedGame
          ? [...currentCompletedGames, GAME_ID]
          : currentCompletedGames

      const payload: IUpdatePlayer = {
        player_id: player.id,
        score: (player.score ?? 0) + earnedPoints,
      }

      if (isLastQuestion && !hasCompletedGame) {
        payload.games_completed = nextCompletedGames
      }

      updatePlayer(payload, {
        onSuccess: () => {
          if (!isLastQuestion) return

          const nextGame = GAME_LINKS.find(
            (game) => !nextCompletedGames.includes(game.id)
          )

          if (!nextGame || nextCompletedGames.length >= TOTAL_GAMES) {
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

    setTimeout(() => {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedCategory(null)
      setIsLocked(false)
    }, 1000)
  }

  return (
    <Dashboard>
      {hasPlayedGame ? (
        <MoveToNextGame completedGameId={GAME_ID} />
      ) : showInfo ? (
        <GameInfo
          setOpen={setShowInfo}
          gameName={gameName}
          gameInfo="Sort cybersecurity concepts into the correct categories. This game
            tests your understanding of what cybersecurity protects: devices,
            networks, applications, data, and people."
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
              <p className="text-xs text-muted-foreground">Score</p>
              <p className="text-lg font-bold">{score.toFixed(1)}/10</p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
              <span>
                Question {currentQuestionIndex + 1} of {totalQuestions}
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

          <div className="mt-5 rounded-2xl border bg-background p-6">
            <div className="flex items-center gap-2 text-primary">
              <FilterIcon className="size-4" />
              <p className="text-xs font-medium tracking-widest uppercase">
                Sort this cybersecurity item
              </p>
            </div>

            <h2 className="mt-3 text-xl font-bold">{currentQuestion.item}</h2>
          </div>

          <div className="mt-5 grid gap-2">
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category
              const isCorrectCategory =
                category === currentQuestion.correctCategory

              return (
                <Button
                  key={category}
                  variant="outline"
                  disabled={isLocked}
                  onClick={() => handleSelectCategory(category)}
                  className={cn(
                    "h-11 justify-start",
                    isLocked &&
                      isSelected &&
                      isCorrectCategory &&
                      "border-primary bg-primary/10 text-primary",
                    isLocked &&
                      isSelected &&
                      !isCorrectCategory &&
                      "border-destructive bg-destructive/10 text-destructive",
                    isLocked &&
                      !isSelected &&
                      isCorrectCategory &&
                      "border-primary/70"
                  )}
                >
                  {category}
                </Button>
              )
            })}
          </div>
        </div>
      )}
    </Dashboard>
  )
}
