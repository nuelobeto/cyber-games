"use client"

import { Dashboard } from "@/components/layout/dashboard"
import { GameInfo } from "@/components/features/game-info"
import { MoveToNextGame } from "@/components/features/move-to-next-game"
import { Button } from "@/components/ui/button"
import { usePlayer } from "@/hooks/useSubscriptions"
import { useUpdatePlayerMutation } from "@/hooks/useMutation"
import { GAME_LINKS, ROUTES, TOTAL_GAMES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { IUpdatePlayer } from "@/types"
import { AlertTriangle, CheckCircle2, UserCog2 } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

const GAME_ID = "game-4"
const GAME_MAX_SCORE = 10

type Decision = "safe" | "suspicious"

type Scenario = {
  id: string
  title: string
  message: string
  correctDecision: Decision
  explanation: string
}

const SCENARIOS: Scenario[] = [
  {
    id: "q1",
    title: "Password Reset",
    message:
      "You receive an email saying your account will be deleted in 10 minutes unless you click a link to reset your password.",
    correctDecision: "suspicious",
    explanation:
      "Attackers often create urgency to pressure people into clicking phishing links.",
  },
  {
    id: "q2",
    title: "Teacher Announcement",
    message:
      "Your teacher posts an assignment update in the official class platform you normally use.",
    correctDecision: "safe",
    explanation:
      "The message comes through an expected official channel, so it is likely safe.",
  },
  {
    id: "q3",
    title: "IT Support Call",
    message:
      "Someone calls claiming to be IT support and asks for your password to fix your account.",
    correctDecision: "suspicious",
    explanation: "Legitimate support should never ask for your password.",
  },
  {
    id: "q4",
    title: "App Notification",
    message:
      "Your banking app sends a login confirmation notification after you just signed in.",
    correctDecision: "safe",
    explanation:
      "This matches an action you just performed, so it is expected.",
  },
  {
    id: "q5",
    title: "Prize Message",
    message:
      "A message says you won a free phone, but you must enter your login details to claim it.",
    correctDecision: "suspicious",
    explanation:
      "Unexpected prizes asking for login details are common social engineering tricks.",
  },
  {
    id: "q6",
    title: "Colleague Requests Public File",
    message:
      "A colleague asks you to resend a public document that is already approved for sharing.",
    correctDecision: "safe",
    explanation:
      "Sharing approved public information through a normal channel is generally safe.",
  },
  {
    id: "q7",
    title: "USB Drive",
    message:
      "You find a USB drive in the hallway with a label saying ‘Exam Answers’ and plug it into your laptop.",
    correctDecision: "suspicious",
    explanation:
      "Unknown USB drives can contain malware and should not be plugged into your device.",
  },
  {
    id: "q8",
    title: "Login Page",
    message:
      "A link opens a login page that looks almost correct, but the web address has extra strange characters.",
    correctDecision: "suspicious",
    explanation: "Lookalike websites are often used to steal passwords.",
  },
  {
    id: "q9",
    title: "Reset Request",
    message:
      "You requested a password reset yourself and receive a reset email immediately after.",
    correctDecision: "safe",
    explanation: "This is expected because you initiated the reset process.",
  },
  {
    id: "q10",
    title: "CEO Gift Card Request",
    message:
      "An email claims to be from the CEO and asks you to urgently buy gift cards without telling anyone.",
    correctDecision: "suspicious",
    explanation:
      "Gift card requests with secrecy and urgency are a common scam pattern.",
  },
]

export default function Game4() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const sessionId = searchParams.get("sessionId") ?? ""
  const playerId = searchParams.get("playerId") ?? ""

  const { data: player } = usePlayer(playerId)
  const { mutate: updatePlayer } = useUpdatePlayerMutation()

  const [showInfo, setShowInfo] = useState(true)
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0)
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(
    null
  )
  const [isLocked, setIsLocked] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)

  const hasPlayedGame = player?.games_completed?.includes(GAME_ID)

  const currentScenario = SCENARIOS[currentScenarioIndex]
  const totalScenarios = SCENARIOS.length
  const isLastScenario = currentScenarioIndex === totalScenarios - 1

  const pointsPerScenario = GAME_MAX_SCORE / totalScenarios

  const pathname = usePathname()

  const currentGame = GAME_LINKS.find((game) => game.href === pathname)

  const gameName = currentGame?.label ?? "Cyber Games"

  const progress = useMemo(() => {
    return Math.round(((currentScenarioIndex + 1) / totalScenarios) * 100)
  }, [currentScenarioIndex, totalScenarios])

  function moveToNextGame(updatedCompletedGames: string[]) {
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
  }

  function handleDecision(decision: Decision) {
    if (isLocked) return

    setSelectedDecision(decision)
    setIsLocked(true)

    const isCorrect = decision === currentScenario.correctDecision
    const earnedPoints = isCorrect ? pointsPerScenario : 0
    const nextCorrectAnswers = correctAnswers + (isCorrect ? 1 : 0)

    setCorrectAnswers(nextCorrectAnswers)

    if (player?.id) {
      const currentCompletedGames = player.games_completed ?? []
      const hasCompletedGame = currentCompletedGames.includes(GAME_ID)

      const updatedCompletedGames =
        isLastScenario && !hasCompletedGame
          ? [...currentCompletedGames, GAME_ID]
          : currentCompletedGames

      const payload: IUpdatePlayer = {
        player_id: player.id,
        score: (player.score ?? 0) + earnedPoints,
      }

      if (isLastScenario && !hasCompletedGame) {
        payload.games_completed = updatedCompletedGames
      }

      updatePlayer(payload, {
        onSuccess: () => {
          if (isLastScenario) {
            moveToNextGame(updatedCompletedGames)
          }
        },
      })
    }

    setTimeout(() => {
      if (isLastScenario) return

      setCurrentScenarioIndex((prev) => prev + 1)
      setSelectedDecision(null)
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
          gameInfo="Decide whether each message or situation is safe or suspicious. This game teaches phishing, impersonation, urgency tricks, fake support requests, suspicious links, and other social engineering warning signs."
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
                {correctAnswers}/{totalScenarios}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
              <span>
                Scenario {currentScenarioIndex + 1} of {totalScenarios}
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

          <div className="mt-5 rounded-2xl border bg-background p-5">
            <div className="flex items-center gap-2 text-primary">
              <UserCog2 className="size-4" />
              <p className="text-xs font-medium tracking-widest uppercase">
                Situation
              </p>
            </div>

            <h2 className="mt-3 text-xl font-bold">{currentScenario.title}</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {currentScenario.message}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button
              size="lg"
              variant="outline"
              disabled={isLocked}
              onClick={() => handleDecision("safe")}
              className={cn(
                "h-20 flex-col gap-2 rounded-2xl",
                isLocked &&
                  selectedDecision === "safe" &&
                  currentScenario.correctDecision === "safe" &&
                  "border-primary bg-primary/10 text-primary",
                isLocked &&
                  selectedDecision === "safe" &&
                  currentScenario.correctDecision !== "safe" &&
                  "border-destructive bg-destructive/10 text-destructive"
              )}
            >
              <CheckCircle2 className="size-5" />
              Safe
            </Button>

            <Button
              size="lg"
              variant="outline"
              disabled={isLocked}
              onClick={() => handleDecision("suspicious")}
              className={cn(
                "h-20 flex-col gap-2 rounded-2xl",
                isLocked &&
                  selectedDecision === "suspicious" &&
                  currentScenario.correctDecision === "suspicious" &&
                  "border-primary bg-primary/10 text-primary",
                isLocked &&
                  selectedDecision === "suspicious" &&
                  currentScenario.correctDecision !== "suspicious" &&
                  "border-destructive bg-destructive/10 text-destructive"
              )}
            >
              <AlertTriangle className="size-5" />
              Suspicious
            </Button>
          </div>
        </div>
      )}
    </Dashboard>
  )
}
