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
import { CheckCircle2, Link2Icon, ShieldAlert } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

const GAME_ID = "game-5"
const GAME_MAX_SCORE = 10

type Decision = "legit" | "phishing"

type LinkChallenge = {
  id: string
  title: string
  url: string
  context: string
  correctDecision: Decision
  explanation: string
}

const LINK_CHALLENGES: LinkChallenge[] = [
  {
    id: "q1",
    title: "Bank Login Link",
    url: "https://secure-bank-login.example.com",
    context:
      "You receive a text saying your bank account is locked and you must sign in immediately.",
    correctDecision: "phishing",
    explanation:
      "The domain is not the official bank domain. Attackers often use urgent messages and fake login pages.",
  },
  {
    id: "q2",
    title: "School Portal",
    url: "https://portal.school.edu",
    context:
      "Your school tells students to submit assignments through its normal portal.",
    correctDecision: "legit",
    explanation:
      "This uses the expected school domain and matches the normal assignment workflow.",
  },
  {
    id: "q3",
    title: "Lookalike Microsoft Link",
    url: "https://micros0ft-login.example.net",
    context:
      "An email says your Microsoft account needs verification before the end of the day.",
    correctDecision: "phishing",
    explanation:
      "The domain uses a lookalike spelling. The letter 'o' is replaced with zero.",
  },
  {
    id: "q4",
    title: "Official Password Reset",
    url: "https://accounts.google.com/signin/recovery",
    context:
      "You requested a Google account recovery link and received this page.",
    correctDecision: "legit",
    explanation:
      "The domain is accounts.google.com and the action matches something you requested.",
  },
  {
    id: "q5",
    title: "Free Prize Link",
    url: "http://claim-free-phone-now.example.org",
    context: "A message says you won a free phone and must log in to claim it.",
    correctDecision: "phishing",
    explanation:
      "Unexpected prizes and pressure to log in are common phishing tricks.",
  },
  {
    id: "q6",
    title: "Company Intranet",
    url: "https://intranet.company.com",
    context:
      "Your manager asks you to open the normal internal company intranet.",
    correctDecision: "legit",
    explanation:
      "The link points to the expected company domain and normal internal resource.",
  },
  {
    id: "q7",
    title: "Fake Delivery Tracking",
    url: "https://delivery-track-update.example.com",
    context: "You receive a message about a package you did not order.",
    correctDecision: "phishing",
    explanation:
      "Unexpected delivery messages can be used to trick users into clicking unsafe links.",
  },
  {
    id: "q8",
    title: "Suspicious Subdomain",
    url: "https://paypal.com.security-check.example.com",
    context: "A message claims PayPal needs you to confirm your identity.",
    correctDecision: "phishing",
    explanation:
      "The real domain is example.com, not paypal.com. Attackers can place trusted names in subdomains.",
  },
  {
    id: "q9",
    title: "Known Learning Site",
    url: "https://learn.cybergames.com",
    context:
      "You are already using Cyber Games and click a lesson link inside the app.",
    correctDecision: "legit",
    explanation:
      "The link is from the expected Cyber Games domain and appears in the correct context.",
  },
  {
    id: "q10",
    title: "Shortened Unknown Link",
    url: "https://bit.ly/urgent-login-check",
    context:
      "An unknown sender sends a shortened link asking you to verify your account.",
    correctDecision: "phishing",
    explanation:
      "Shortened links can hide the real destination, especially when sent by unknown people.",
  },
]

export default function Game5() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const sessionId = searchParams.get("sessionId") ?? ""
  const playerId = searchParams.get("playerId") ?? ""

  const { data: player } = usePlayer(playerId)
  const { mutate: updatePlayer } = useUpdatePlayerMutation()

  const [showInfo, setShowInfo] = useState(true)
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0)
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(
    null
  )
  const [isLocked, setIsLocked] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)

  const hasPlayedGame = player?.games_completed?.includes(GAME_ID)

  const currentChallenge = LINK_CHALLENGES[currentChallengeIndex]
  const totalChallenges = LINK_CHALLENGES.length
  const isLastChallenge = currentChallengeIndex === totalChallenges - 1

  const pointsPerChallenge = GAME_MAX_SCORE / totalChallenges

  const pathname = usePathname()

  const currentGame = GAME_LINKS.find((game) => game.href === pathname)

  const gameName = currentGame?.label ?? "Cyber Games"

  const progress = useMemo(() => {
    return Math.round(((currentChallengeIndex + 1) / totalChallenges) * 100)
  }, [currentChallengeIndex, totalChallenges])

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

    const isCorrect = decision === currentChallenge.correctDecision
    const earnedPoints = isCorrect ? pointsPerChallenge : 0
    const nextCorrectAnswers = correctAnswers + (isCorrect ? 1 : 0)

    setCorrectAnswers(nextCorrectAnswers)

    if (player?.id) {
      const currentCompletedGames = player.games_completed ?? []
      const hasCompletedGame = currentCompletedGames.includes(GAME_ID)

      const updatedCompletedGames =
        isLastChallenge && !hasCompletedGame
          ? [...currentCompletedGames, GAME_ID]
          : currentCompletedGames

      const payload: IUpdatePlayer = {
        player_id: player.id,
        score: (player.score ?? 0) + earnedPoints,
      }

      if (isLastChallenge && !hasCompletedGame) {
        payload.games_completed = updatedCompletedGames
      }

      updatePlayer(payload, {
        onSuccess: () => {
          if (isLastChallenge) {
            moveToNextGame(updatedCompletedGames)
          }
        },
      })
    }

    setTimeout(() => {
      if (isLastChallenge) return

      setCurrentChallengeIndex((prev) => prev + 1)
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
          gameInfo="Inspect each link and decide whether it is legitimate or phishing. This game teaches lookalike domains, suspicious links, fake urgency, unknown senders, shortened URLs, and unsafe login pages."
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
                {correctAnswers}/{totalChallenges}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
              <span>
                Link {currentChallengeIndex + 1} of {totalChallenges}
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
              <Link2Icon className="size-4" />
              <p className="text-xs font-medium tracking-widest uppercase">
                Link Check
              </p>
            </div>

            <h2 className="mt-3 text-xl font-bold">{currentChallenge.title}</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {currentChallenge.context}
            </p>

            <div className="mt-4 overflow-hidden rounded-xl border bg-card p-3">
              <p className="font-mono text-sm break-all">
                {currentChallenge.url}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button
              size="lg"
              variant="outline"
              disabled={isLocked}
              onClick={() => handleDecision("legit")}
              className={cn(
                "h-20 flex-col gap-2 rounded-2xl",
                isLocked &&
                  selectedDecision === "legit" &&
                  currentChallenge.correctDecision === "legit" &&
                  "border-primary bg-primary/10 text-primary",
                isLocked &&
                  selectedDecision === "legit" &&
                  currentChallenge.correctDecision !== "legit" &&
                  "border-destructive bg-destructive/10 text-destructive"
              )}
            >
              <CheckCircle2 className="size-5" />
              Legit
            </Button>

            <Button
              size="lg"
              variant="outline"
              disabled={isLocked}
              onClick={() => handleDecision("phishing")}
              className={cn(
                "h-20 flex-col gap-2 rounded-2xl",
                isLocked &&
                  selectedDecision === "phishing" &&
                  currentChallenge.correctDecision === "phishing" &&
                  "border-primary bg-primary/10 text-primary",
                isLocked &&
                  selectedDecision === "phishing" &&
                  currentChallenge.correctDecision !== "phishing" &&
                  "border-destructive bg-destructive/10 text-destructive"
              )}
            >
              <ShieldAlert className="size-5" />
              Phishing
            </Button>
          </div>
        </div>
      )}
    </Dashboard>
  )
}
