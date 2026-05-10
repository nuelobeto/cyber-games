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
import { Network } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

const GAME_ID = "game-6"
const GAME_MAX_SCORE = 10

type Question = {
  title: string
  description: string
  options: string[]
  correctAnswer: string
  explanation: string
}

const QUESTIONS: Question[] = [
  {
    title: "Secure Web Traffic",
    description: "A browser securely connects to a website using encryption.",
    options: ["HTTP", "HTTPS", "Cookie", "LAN"],
    correctAnswer: "HTTPS",
    explanation:
      "HTTPS is HTTP plus encryption using TLS. It protects data in transit.",
  },
  {
    title: "Normal Web Port",
    description: "A website is using plain HTTP by default.",
    options: ["Port 22", "Port 53", "Port 80", "Port 443"],
    correctAnswer: "Port 80",
    explanation: "HTTP operates on port 80 by default.",
  },
  {
    title: "Secure Web Port",
    description: "A website is using HTTPS by default.",
    options: ["Port 21", "Port 80", "Port 443", "Port 3389"],
    correctAnswer: "Port 443",
    explanation: "HTTPS commonly uses port 443.",
  },
  {
    title: "Remembering Login State",
    description:
      "A website needs a way to remember that a user is logged in across requests.",
    options: ["Cookie", "Switch", "Router", "MAC Address"],
    correctAnswer: "Cookie",
    explanation:
      "Cookies are stored in the browser and can carry a session ID so the server can identify the user.",
  },
  {
    title: "Server-Side User State",
    description:
      "User data is stored on the server, and the browser sends an ID back with each request.",
    options: ["Session", "DNS", "WAN", "Physical Layer"],
    correctAnswer: "Session",
    explanation:
      "Sessions store user data on the server, while the browser sends a session ID through a cookie.",
  },
  {
    title: "Domain to IP",
    description:
      "A browser needs to find the IP address for a domain name before connecting.",
    options: ["DNS Lookup", "Hashing", "MFA", "Access Control"],
    correctAnswer: "DNS Lookup",
    explanation:
      "The client performs a DNS lookup to find the server’s IP address.",
  },
  {
    title: "Local Network",
    description:
      "Computers in a school computer lab are connected within a small area.",
    options: ["LAN", "WAN", "MAN", "PAN"],
    correctAnswer: "LAN",
    explanation:
      "A LAN is a local area network, usually within a home, office, or school.",
  },
  {
    title: "Encrypted Tunnel",
    description:
      "A user connects securely from home into an organisation’s network.",
    options: ["VPN", "WLAN", "Switch", "Cookie"],
    correctAnswer: "VPN",
    explanation: "A VPN is an encrypted tunnel between a device and a network.",
  },
  {
    title: "Local Hardware Identity",
    description:
      "This address identifies a device on a local network and exists at Layer 2.",
    options: ["MAC Address", "IP Address", "HTTP", "Session"],
    correctAnswer: "MAC Address",
    explanation:
      "A MAC address is used within local networks and exists at the Data Link Layer.",
  },
  {
    title: "Routing Between Networks",
    description:
      "A device sends packets between different networks using IP addresses.",
    options: ["Router", "Switch", "Access Point", "Cookie"],
    correctAnswer: "Router",
    explanation:
      "Routers operate at Layer 3 and route packets using IP addresses.",
  },
]

export default function Game6() {
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
          gameInfo="Match beginner web and network scenarios to the correct concept. This game teaches HTTP, HTTPS, cookies, sessions, DNS lookup, LAN, WAN, VPN, MAC addresses, IP addresses, switches, routers, and how clients communicate with servers."
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

          <div className="mt-5 rounded-2xl border bg-background p-5">
            <div className="flex items-center gap-2 text-primary">
              <Network className="size-4" />
              <p className="text-xs font-medium tracking-widest uppercase">
                Network Scenario
              </p>
            </div>

            <h2 className="mt-3 text-xl font-bold">{currentQuestion.title}</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {currentQuestion.description}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option
              const isCorrectAnswer = option === currentQuestion.correctAnswer

              return (
                <Button
                  key={option}
                  size="lg"
                  variant="outline"
                  disabled={isLocked}
                  onClick={() => handleAnswer(option)}
                  className={cn(
                    "h-16 rounded-2xl text-lg font-bold",
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
