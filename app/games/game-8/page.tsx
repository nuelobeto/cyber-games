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
import { LockKeyhole } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

const GAME_ID = "game-8"
const GAME_MAX_SCORE = 10

type EncryptionQuestion = {
  id: string
  title: string
  scenario: string
  options: string[]
  correctAnswer: string
  explanation: string
}

const QUESTIONS: EncryptionQuestion[] = [
  {
    id: "q1",
    title: "Readable to Unreadable",
    scenario:
      "A message is converted from readable text into unreadable text so unauthorized people cannot understand it.",
    options: ["Hashing", "Encryption", "Scanning", "Routing"],
    correctAnswer: "Encryption",
    explanation:
      "Encryption converts plaintext into ciphertext so only someone with the right key can read it.",
  },
  {
    id: "q2",
    title: "Same Key Used Twice",
    scenario: "The same secret key is used to encrypt and decrypt a file.",
    options: [
      "Symmetric Encryption",
      "Asymmetric Encryption",
      "TLS",
      "Hashing",
    ],
    correctAnswer: "Symmetric Encryption",
    explanation:
      "Symmetric encryption uses the same key for both encryption and decryption.",
  },
  {
    id: "q3",
    title: "Public and Private Key",
    scenario:
      "One key is public and can be shared, while the private key must be kept secret.",
    options: [
      "Symmetric Encryption",
      "Asymmetric Encryption",
      "Disk Encryption",
      "Encoding",
    ],
    correctAnswer: "Asymmetric Encryption",
    explanation: "Asymmetric encryption uses a public key and a private key.",
  },
  {
    id: "q4",
    title: "Password Storage",
    scenario:
      "A system stores passwords using a one-way transformation that cannot be reversed.",
    options: ["Hashing", "TLS", "VPN", "Session"],
    correctAnswer: "Hashing",
    explanation:
      "Hashing is one-way and is commonly used for password storage.",
  },
  {
    id: "q5",
    title: "Secure Web Traffic",
    scenario:
      "A browser uses HTTPS to protect communication between the browser and server.",
    options: ["TLS Encryption", "MAC Address", "Access Point", "Plain HTTP"],
    correctAnswer: "TLS Encryption",
    explanation:
      "TLS is used by HTTPS to protect web traffic between the browser and server.",
  },
  {
    id: "q6",
    title: "Lost Laptop",
    scenario:
      "A laptop is stolen, but the files on the drive cannot be read without the correct key.",
    options: [
      "Disk/Storage Encryption",
      "DNS Lookup",
      "Session Cookie",
      "Open Port",
    ],
    correctAnswer: "Disk/Storage Encryption",
    explanation:
      "Disk or storage encryption protects data stored on laptops, servers, or mobile devices.",
  },
  {
    id: "q7",
    title: "Attacker Listening on Network",
    scenario:
      "An attacker tries to read data being sent across a public Wi-Fi network.",
    options: [
      "Eavesdropping",
      "Version Control",
      "Load Balancing",
      "Privilege Escalation",
    ],
    correctAnswer: "Eavesdropping",
    explanation:
      "Encryption helps protect against eavesdropping and data interception.",
  },
  {
    id: "q8",
    title: "Data Moving Across Network",
    scenario:
      "Sensitive information is being transmitted between a client and a server.",
    options: ["Data in Transit", "Data at Rest", "Data Deleted", "Data Cached"],
    correctAnswer: "Data in Transit",
    explanation: "Data in transit means data moving across a network.",
  },
  {
    id: "q9",
    title: "Data Stored on Disk",
    scenario: "Sensitive files are saved on a server hard drive.",
    options: ["Data at Rest", "Data in Transit", "DNS Data", "Session Data"],
    correctAnswer: "Data at Rest",
    explanation: "Data at rest means data stored on a disk, server, or device.",
  },
  {
    id: "q10",
    title: "Main Security Goal",
    scenario:
      "A company encrypts customer records so unauthorized people cannot read them.",
    options: ["Confidentiality", "Availability", "Routing", "Scanning"],
    correctAnswer: "Confidentiality",
    explanation:
      "Encryption mainly supports confidentiality by preventing unauthorized reading of sensitive data.",
  },
]

export default function Game8() {
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
          gameInfo="Match encryption scenarios to the correct security concept. This game teaches encryption, plaintext, ciphertext, symmetric encryption, asymmetric encryption, hashing, TLS, disk encryption, data in transit, data at rest, and confidentiality."
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
                Vault {currentQuestionIndex + 1} of {totalQuestions}
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
              <LockKeyhole className="size-4" />
              <p className="text-xs font-medium tracking-widest uppercase">
                Encryption Scenario
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
