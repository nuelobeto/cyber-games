"use client"

import { Container } from "@/components/layout/container"
import { Footer } from "@/components/layout/footer"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useUpdateSessionStatusMutation } from "@/hooks/useMutation"
import { useSession } from "@/hooks/useSubscriptions"
import { ROUTES } from "@/lib/constants"
import { Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { QRCodeCanvas } from "qrcode.react"
import { useCallback, useEffect, useState } from "react"

export default function SessionCode() {
  const [timeLeft, setTimeLeft] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()

  const sessionId = searchParams.get("sessionId") ?? ""
  const code = searchParams.get("code") ?? ""

  const joinPath = `${ROUTES.join_session}?code=${code}`

  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${joinPath}`
      : joinPath

  const joinSessionUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${ROUTES.join_session}`
      : `${ROUTES.join_session}`

  const { data: session, isLoading } = useSession(sessionId)

  const numberOfParticipants = session?.number_of_participants ?? 0

  const { mutate: updateSessionStatus, status: updateSessionStatusState } =
    useUpdateSessionStatusMutation()

  const isUpdatingSession = updateSessionStatusState === "pending"

  const endSession = () => {
    updateSessionStatus(
      {
        session_id: sessionId,
        status: "ended",
      },
      {
        onSuccess: async () => {
          router.push(ROUTES.home)
        },
      }
    )
  }

  const endSessionAfterStart = useCallback(() => {
    updateSessionStatus(
      {
        session_id: sessionId,
        status: "ended",
      },
      {
        onSuccess: async () => {
          router.replace(`${ROUTES.leader_board}?sessionId=${sessionId}`)
        },
      }
    )
  }, [updateSessionStatus, sessionId, router])

  useEffect(() => {
    if (!session) return
    if (session.status !== "active") return
    if (!session.started_at) return

    let hasEnded = false

    const updateCountdown = async () => {
      const startedAt = new Date(session.started_at as string)
      const endsAt = new Date(
        startedAt.getTime() + session.duration_in_minutes * 60 * 1000
      )

      const difference = endsAt.getTime() - Date.now()

      if (difference <= 0) {
        setTimeLeft("00:00")

        if (!hasEnded) {
          hasEnded = true

          endSessionAfterStart()
        }

        return
      }

      const minutes = Math.floor(difference / 1000 / 60)
      const seconds = Math.floor((difference / 1000) % 60)

      setTimeLeft(
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      )
    }

    updateCountdown()

    const interval = window.setInterval(updateCountdown, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [endSessionAfterStart, router, session, sessionId])

  return (
    <>
      <header className="pt-[57px]">
        <Topbar />
      </header>

      <main>
        <section className="min-h-svh lg:min-h-[calc(100vh-57px)]">
          <Container className="max-w-xl pt-12">
            <h1 className="text-center text-3xl font-bold">
              Session created successfully
            </h1>

            <p className="mt-4 text-center text-muted-foreground">
              Scan QR code or enter code below to Join.
            </p>

            <div className="mt-12 flex flex-col gap-8">
              {/* QR Code */}
              <div className="mx-auto w-fit rounded-2xl border-2 border-primary bg-primary/50 p-1.5">
                <div className="overflow-hidden rounded-xl">
                  <QRCodeCanvas
                    value={joinUrl}
                    size={220}
                    marginSize={2}
                    level="H"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">
                  Visit:{" "}
                  <span className="font-bold text-green-500">
                    {joinSessionUrl}
                  </span>{" "}
                  and enter the code below
                </p>
                <p className="text-center text-3xl font-semibold">{code}</p>
              </div>
            </div>

            <div className="mt-12 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="sm:flex-1"
                disabled={
                  !sessionId ||
                  isUpdatingSession ||
                  session?.status === "active"
                }
                onClick={() => {
                  updateSessionStatus({
                    session_id: sessionId,
                    status: "active",
                  })
                }}
              >
                {isUpdatingSession ? (
                  <Loader2 className="animate-spin" />
                ) : session?.status === "active" ? (
                  <span>Session Started: {timeLeft}</span>
                ) : (
                  "Start Session"
                )}
              </Button>
              {session?.status === "active" && (
                <Button
                  size="lg"
                  variant="destructive"
                  className="sm:flex-1"
                  onClick={endSession}
                >
                  End Session
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="sm:flex-1"
                onClick={() =>
                  router.push(`${ROUTES.leader_board}?sessionId=${sessionId}`)
                }
              >
                Leader Board
              </Button>
            </div>

            <p className="mt-6 text-center text-sm">
              {isLoading
                ? "Loading players..."
                : `${numberOfParticipants} ${
                    numberOfParticipants === 1 ? "Player" : "Players"
                  } joined`}
            </p>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  )
}
