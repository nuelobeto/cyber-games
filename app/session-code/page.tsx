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

export default function SessionCode() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const sessionId = searchParams.get("sessionId") ?? ""
  const code = searchParams.get("code") ?? ""

  const joinPath = `${ROUTES.join_session}?code=${code}`

  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${joinPath}`
      : joinPath

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

  console.log(sessionId)

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

              <p className="text-center text-3xl font-semibold">{code}</p>
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
                  "Session Started"
                ) : (
                  "Start Session"
                )}
              </Button>
              <Button
                size="lg"
                variant="destructive"
                className="sm:flex-1"
                onClick={endSession}
              >
                End Session
              </Button>
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
