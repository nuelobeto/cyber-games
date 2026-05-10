"use client"

import { Dashboard } from "@/components/layout/dashboard"
import { Button } from "@/components/ui/button"
import { usePlayer } from "@/hooks/useSubscriptions"
import { useUpdatePlayerMutation } from "@/hooks/useMutation"
import { GAME_LINKS, ROUTES, TOTAL_GAMES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { IUpdatePlayer } from "@/types"
import { ShieldCheck, ShieldX, UserKeyIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { MoveToNextGame } from "@/components/features/move-to-next-game"
import { GameInfo } from "@/components/features/game-info"

const GAME_ID = "game-3"
const GAME_MAX_SCORE = 10

type Decision = "allow" | "block"

type IdentityGateChallenge = {
  id: string
  title: string
  description: string
  correctDecision: Decision
  explanation: string
}

const CHALLENGES: IdentityGateChallenge[] = [
  {
    id: "q1",
    title: "Known user with MFA",
    description:
      "A user logs in from their usual device and completes multi-factor authentication.",
    correctDecision: "allow",
    explanation:
      "This is a normal login pattern because the device is familiar and MFA was completed.",
  },
  {
    id: "q2",
    title: "Unusual country login",
    description:
      "A user account suddenly logs in from a country they have never used before.",
    correctDecision: "block",
    explanation:
      "An unusual location can indicate suspicious account activity and should be checked.",
  },
  {
    id: "q3",
    title: "Shared password request",
    description:
      "A teammate asks another user to share their password so they can quickly access a file.",
    correctDecision: "block",
    explanation:
      "Passwords should not be shared. Each user should use their own account and permissions.",
  },
  {
    id: "q4",
    title: "Password reset from official page",
    description:
      "A user resets their password from the official company password reset page.",
    correctDecision: "allow",
    explanation:
      "Using the official password reset process is a safe and expected account recovery action.",
  },
  {
    id: "q5",
    title: "Suspicious email link",
    description:
      "A user clicks a login link from an unexpected email asking them to verify their account.",
    correctDecision: "block",
    explanation:
      "Unexpected login links can be phishing attempts and should not be trusted without verification.",
  },
  {
    id: "q6",
    title: "Admin access request",
    description:
      "A regular user requests admin access without a clear business reason.",
    correctDecision: "block",
    explanation:
      "Admin access should follow least privilege. Users should only get permissions they truly need.",
  },
  {
    id: "q7",
    title: "Recognised device login",
    description:
      "A student logs in from the same laptop they normally use during the training session.",
    correctDecision: "allow",
    explanation:
      "A recognised device and expected activity are usually safe when other checks are normal.",
  },
  {
    id: "q8",
    title: "Many failed attempts",
    description:
      "An account has ten failed login attempts within a few minutes.",
    correctDecision: "block",
    explanation:
      "Many failed attempts can indicate password guessing or automated login attempts.",
  },
  {
    id: "q9",
    title: "Expired session token",
    description:
      "A user tries to continue using an old session token after it has expired.",
    correctDecision: "block",
    explanation:
      "Expired sessions should not be accepted because they may create security risks.",
  },
  {
    id: "q10",
    title: "Valid role-based access",
    description:
      "A finance staff member accesses a finance dashboard assigned to their role.",
    correctDecision: "allow",
    explanation:
      "Role-based access is valid when the user’s role matches the resource they are accessing.",
  },
]

export default function Game3() {
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

  const currentChallenge = CHALLENGES[currentChallengeIndex]
  const totalChallenges = CHALLENGES.length
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
          gameInfo="Act as the security gatekeeper. Review each login or access attempt and decide whether it should be allowed or blocked. This game teaches identity security, least privilege, MFA, suspicious logins, and access control basics."
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
                Challenge {currentChallengeIndex + 1} of {totalChallenges}
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
              <UserKeyIcon className="size-4" />
              <p className="text-xs font-medium tracking-widest uppercase">
                Access Request
              </p>
            </div>

            <h2 className="mt-3 text-xl font-bold">{currentChallenge.title}</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {currentChallenge.description}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button
              size="lg"
              variant="outline"
              disabled={isLocked}
              onClick={() => handleDecision("allow")}
              className={cn(
                "h-20 flex-col gap-2 rounded-2xl",
                isLocked &&
                  selectedDecision === "allow" &&
                  currentChallenge.correctDecision === "allow" &&
                  "border-primary bg-primary/10 text-primary",
                isLocked &&
                  selectedDecision === "allow" &&
                  currentChallenge.correctDecision !== "allow" &&
                  "border-destructive bg-destructive/10 text-destructive"
              )}
            >
              <ShieldCheck className="size-5" />
              Allow
            </Button>

            <Button
              size="lg"
              variant="outline"
              disabled={isLocked}
              onClick={() => handleDecision("block")}
              className={cn(
                "h-20 flex-col gap-2 rounded-2xl",
                isLocked &&
                  selectedDecision === "block" &&
                  currentChallenge.correctDecision === "block" &&
                  "border-primary bg-primary/10 text-primary",
                isLocked &&
                  selectedDecision === "block" &&
                  currentChallenge.correctDecision !== "block" &&
                  "border-destructive bg-destructive/10 text-destructive"
              )}
            >
              <ShieldX className="size-5" />
              Block
            </Button>
          </div>
        </div>
      )}
    </Dashboard>
  )
}
