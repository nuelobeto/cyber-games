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
import { ShieldAlert } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

const GAME_ID = "game-7"
const GAME_MAX_SCORE = 10

type OWASPQuestion = {
  id: string
  title: string
  scenario: string
  options: string[]
  correctAnswer: string
  explanation: string
}

const QUESTIONS: OWASPQuestion[] = [
  {
    id: "q1",
    title: "Accessing Another User’s Profile",
    scenario:
      "A user changes the ID in the URL and can view another user’s private profile.",
    options: [
      "Broken Access Control",
      "Cryptographic Failures",
      "Injection",
      "Security Misconfiguration",
    ],
    correctAnswer: "Broken Access Control",
    explanation:
      "Broken Access Control happens when users can access data or actions they should not be allowed to access.",
  },
  {
    id: "q2",
    title: "Plain Text Passwords",
    scenario:
      "A website stores user passwords in readable text instead of protecting them properly.",
    options: ["Injection", "Cryptographic Failures", "SSRF", "Insecure Design"],
    correctAnswer: "Cryptographic Failures",
    explanation:
      "Cryptographic Failures involve exposing sensitive data because encryption or secure storage is missing or weak.",
  },
  {
    id: "q3",
    title: "Malicious Input",
    scenario:
      "An attacker enters database commands into a login form and changes how the query runs.",
    options: [
      "Injection",
      "Broken Access Control",
      "Vulnerable & Outdated Components",
      "Security Logging & Monitoring Failures",
    ],
    correctAnswer: "Injection",
    explanation:
      "Injection occurs when attackers insert malicious code or commands into application inputs.",
  },
  {
    id: "q4",
    title: "Default Admin Panel",
    scenario:
      "A production admin panel is exposed online using default settings.",
    options: [
      "Security Misconfiguration",
      "Software & Data Integrity Failures",
      "Cryptographic Failures",
      "Identification & Authentication Failures",
    ],
    correctAnswer: "Security Misconfiguration",
    explanation:
      "Security Misconfiguration includes insecure settings, default passwords, open ports, and exposed admin panels.",
  },
  {
    id: "q5",
    title: "Old Library",
    scenario:
      "A web app uses an old JavaScript library with a known security vulnerability.",
    options: [
      "Insecure Design",
      "Vulnerable & Outdated Components",
      "Injection",
      "SSRF",
    ],
    correctAnswer: "Vulnerable & Outdated Components",
    explanation:
      "This happens when old libraries, frameworks, or software with known vulnerabilities remain in use.",
  },
  {
    id: "q6",
    title: "Weak Login System",
    scenario:
      "A website allows unlimited password guesses and does not use MFA.",
    options: [
      "Identification & Authentication Failures",
      "Broken Access Control",
      "Cryptographic Failures",
      "Software & Data Integrity Failures",
    ],
    correctAnswer: "Identification & Authentication Failures",
    explanation:
      "Weak login systems, poor session management, and missing MFA fit Identification and Authentication Failures.",
  },
  {
    id: "q7",
    title: "Untrusted Update",
    scenario:
      "An application installs an update package without checking whether it was tampered with.",
    options: [
      "Software & Data Integrity Failures",
      "Security Misconfiguration",
      "Injection",
      "SSRF",
    ],
    correctAnswer: "Software & Data Integrity Failures",
    explanation:
      "Software and Data Integrity Failures involve untrusted code updates, tampered packages, and dependency attacks.",
  },
  {
    id: "q8",
    title: "No Alerts",
    scenario:
      "Attackers try many login attempts, but the system keeps no logs and sends no alerts.",
    options: [
      "Security Logging & Monitoring Failures",
      "Broken Access Control",
      "Insecure Design",
      "Cryptographic Failures",
    ],
    correctAnswer: "Security Logging & Monitoring Failures",
    explanation:
      "If attacks go unnoticed because logging, monitoring, or alerting is missing, it is a logging and monitoring failure.",
  },
  {
    id: "q9",
    title: "Server Fetch Trick",
    scenario:
      "An attacker tricks the server into requesting an internal admin-only URL.",
    options: [
      "SSRF",
      "Injection",
      "Security Misconfiguration",
      "Identification & Authentication Failures",
    ],
    correctAnswer: "SSRF",
    explanation:
      "Server-Side Request Forgery happens when an attacker tricks a server into making internal or external requests.",
  },
  {
    id: "q10",
    title: "Security Added Too Late",
    scenario:
      "A payment system is designed without considering fraud prevention or abuse cases.",
    options: [
      "Insecure Design",
      "Broken Access Control",
      "Cryptographic Failures",
      "Vulnerable & Outdated Components",
    ],
    correctAnswer: "Insecure Design",
    explanation:
      "Insecure Design means the architecture itself is flawed because security was not built into the system early enough.",
  },
]

export default function Game7() {
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
          gameInfo="Match common web security problems to the correct OWASP Top 10 category. This game teaches broken access control, cryptographic failures, injection, insecure design, security misconfiguration, outdated components, authentication failures, logging failures, integrity failures, and SSRF."
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
                Case {currentQuestionIndex + 1} of {totalQuestions}
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
              <ShieldAlert className="size-4" />
              <p className="text-xs font-medium tracking-widest uppercase">
                Web Security Case
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
