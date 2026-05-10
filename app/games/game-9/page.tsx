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
import { Brain } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

const GAME_ID = "game-9"
const GAME_MAX_SCORE = 10

type HumanFirewallQuestion = {
  id: string
  title: string
  scenario: string
  options: string[]
  correctAnswer: string
  explanation: string
}

const QUESTIONS: HumanFirewallQuestion[] = [
  {
    id: "q1",
    title: "Suspicious Email",
    scenario:
      "You receive an email asking you to click a link urgently to avoid losing access to your account.",
    options: [
      "Click the link quickly",
      "Ignore the warning signs",
      "Verify the message through an official channel",
      "Forward it to friends",
    ],
    correctAnswer: "Verify the message through an official channel",
    explanation:
      "Social engineering often uses urgency. Verifying through an official channel is safer.",
  },
  {
    id: "q2",
    title: "Weak Password Habit",
    scenario:
      "A user wants to reuse the same password across school, banking, and social media accounts.",
    options: [
      "Reuse it to remember easily",
      "Use unique strong passwords",
      "Write it publicly on a sticky note",
      "Share it with a friend",
    ],
    correctAnswer: "Use unique strong passwords",
    explanation:
      "Reusing passwords is risky because one breached account can affect many others.",
  },
  {
    id: "q3",
    title: "Fake IT Support",
    scenario:
      "Someone calls claiming to be IT support and asks for your password.",
    options: [
      "Give them the password",
      "Ask them to call later",
      "Refuse and report the request",
      "Send it by email instead",
    ],
    correctAnswer: "Refuse and report the request",
    explanation:
      "Legitimate support should not ask for your password. This is a social engineering warning sign.",
  },
  {
    id: "q4",
    title: "Oversharing Online",
    scenario:
      "A student posts their school ID, birthday, location, and daily routine publicly online.",
    options: [
      "This is harmless",
      "Post even more details",
      "Reduce public personal information",
      "Tag everyone they know",
    ],
    correctAnswer: "Reduce public personal information",
    explanation:
      "Oversharing can help attackers guess passwords, impersonate users, or target victims.",
  },
  {
    id: "q5",
    title: "Ignoring Updates",
    scenario:
      "A laptop keeps asking for security updates, but the user keeps postponing them.",
    options: [
      "Ignore updates forever",
      "Install updates from trusted sources",
      "Disable security alerts",
      "Only update after a hack",
    ],
    correctAnswer: "Install updates from trusted sources",
    explanation:
      "Ignoring updates can leave known vulnerabilities open to attackers.",
  },
  {
    id: "q6",
    title: "Mistaken Data Sharing",
    scenario:
      "An employee accidentally sends sensitive data to the wrong person.",
    options: [
      "Hide the mistake",
      "Report it quickly",
      "Blame someone else",
      "Delete the email and say nothing",
    ],
    correctAnswer: "Report it quickly",
    explanation:
      "A supportive no-blame reporting culture helps organisations respond quickly to mistakes.",
  },
  {
    id: "q7",
    title: "Rushed Decision",
    scenario:
      "A user is stressed and clicks through security warnings to finish quickly.",
    options: [
      "Slow down and review the warning",
      "Click faster",
      "Disable warnings",
      "Ignore all alerts",
    ],
    correctAnswer: "Slow down and review the warning",
    explanation:
      "Stress and hurry can lead to risky decisions. Slowing down improves security behaviour.",
  },
  {
    id: "q8",
    title: "Security Too Complicated",
    scenario:
      "A security process is so confusing that users start bypassing it.",
    options: [
      "Make the process harder",
      "Balance security with usability",
      "Punish everyone immediately",
      "Remove all security",
    ],
    correctAnswer: "Balance security with usability",
    explanation:
      "Good cybersecurity balances security and convenience so people are less likely to bypass controls.",
  },
  {
    id: "q9",
    title: "Insider Risk",
    scenario:
      "A contractor still has access to company systems after their work ended.",
    options: [
      "Leave access active",
      "Remove access when no longer needed",
      "Give more permissions",
      "Share the account",
    ],
    correctAnswer: "Remove access when no longer needed",
    explanation:
      "Insider threats can be accidental, malicious, or compromised. Access should be managed carefully.",
  },
  {
    id: "q10",
    title: "Security Culture",
    scenario:
      "Employees are afraid to report mistakes because they think they will be blamed.",
    options: [
      "Encourage no-blame reporting",
      "Punish every report",
      "Ignore incidents",
      "Tell people to stay silent",
    ],
    correctAnswer: "Encourage no-blame reporting",
    explanation:
      "A strong security culture encourages people to report incidents and learn from mistakes.",
  },
]

export default function Game9() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const sessionId = searchParams.get("sessionId") ?? ""
  const playerId = searchParams.get("playerId") ?? ""

  const { data: player } = usePlayer(playerId)
  const { mutate: updatePlayer } = useUpdatePlayerMutation()

  const [showInfo, setShowInfo] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)

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

  function handleAnswer(answer: string) {
    if (isLocked) return

    setSelectedAnswer(answer)
    setIsLocked(true)

    const isCorrect = answer === currentQuestion.correctAnswer
    const earnedPoints = isCorrect ? pointsPerQuestion : 0
    const nextCorrectAnswers = correctAnswers + (isCorrect ? 1 : 0)

    setCorrectAnswers(nextCorrectAnswers)

    if (player?.id) {
      const currentCompletedGames = player.games_completed ?? []
      const hasCompletedGame = currentCompletedGames.includes(GAME_ID)

      const updatedCompletedGames =
        isLastQuestion && !hasCompletedGame
          ? [...currentCompletedGames, GAME_ID]
          : currentCompletedGames

      const payload: IUpdatePlayer = {
        player_id: player.id,
        score: (player.score ?? 0) + earnedPoints,
      }

      if (isLastQuestion && !hasCompletedGame) {
        payload.games_completed = updatedCompletedGames
      }

      updatePlayer(payload, {
        onSuccess: () => {
          if (isLastQuestion) {
            moveToNextGame(updatedCompletedGames)
          }
        },
      })
    }

    setTimeout(() => {
      if (isLastQuestion) return

      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
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
          gameInfo="Choose the safest response to human-factor cybersecurity scenarios. This game teaches phishing awareness, weak passwords, oversharing, social engineering, updates, reporting culture, insider threats, and secure behaviour."
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
                {correctAnswers}/{totalQuestions}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
              <span>
                Scenario {currentQuestionIndex + 1} of {totalQuestions}
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
              <Brain className="size-4" />
              <p className="text-xs font-medium tracking-widest uppercase">
                Human Factor Scenario
              </p>
            </div>

            <h2 className="mt-3 text-xl font-bold">{currentQuestion.title}</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {currentQuestion.scenario}
            </p>
          </div>

          <div className="mt-5 grid gap-2">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option
              const isCorrectAnswer = option === currentQuestion.correctAnswer

              return (
                <Button
                  key={option}
                  variant="outline"
                  disabled={isLocked}
                  onClick={() => handleAnswer(option)}
                  className={cn(
                    "h-auto min-h-11 justify-start rounded-xl py-3 text-left whitespace-normal",
                    isLocked &&
                      isSelected &&
                      isCorrectAnswer &&
                      "border-primary bg-primary/10 text-primary",
                    isLocked &&
                      isSelected &&
                      !isCorrectAnswer &&
                      "border-destructive bg-destructive/10 text-destructive",
                    isLocked &&
                      !isSelected &&
                      isCorrectAnswer &&
                      "border-primary/70"
                  )}
                >
                  {option}
                </Button>
              )
            })}
          </div>
        </div>
      )}
    </Dashboard>
  )
}
