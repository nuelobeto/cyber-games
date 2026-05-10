"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Container } from "./container"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { usePlayer, useSession } from "@/hooks/useSubscriptions"
import { FIRST_AVATAR, GAME_LINKS, ROUTES } from "@/lib/constants"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Gamepad2Icon, HomeIcon, Trophy } from "lucide-react"
import { ScrollArea } from "../ui/scroll-area"
import Link from "next/link"
import { useState } from "react"
import { Separator } from "../ui/separator"
import Image from "next/image"
import { Button } from "../ui/button"
import { CreateSessionDialog } from "../features/createSessionDialog"

interface Props {
  children: React.ReactNode
}

export const Dashboard = ({ children }: Props) => {
  const [openSidebar, setOpenSidebar] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  const sessionId = searchParams.get("sessionId") ?? ""
  const playerId = searchParams.get("playerId") ?? ""

  const { data: session } = useSession(sessionId)
  const { data: player } = usePlayer(playerId)

  const username = player?.username || "Player"
  const avatar = player?.avatar || FIRST_AVATAR

  const pathname = usePathname()

  const currentGame = GAME_LINKS.find((game) => game.href === pathname)

  const gameName = currentGame?.label ?? "Cyber Games"

  const sessionHasEnded = session?.status === "ended"
  const showPlayerStats = Boolean(playerId && player)

  return (
    <>
      <header className="w-full border-b">
        <Container className="flex h-14 items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-bold">{gameName}</h1>
          </div>

          {player && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">{username}</span>
              <Avatar>
                <AvatarImage src={avatar} />
                <AvatarFallback>
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </Container>
      </header>

      <main className="h-[calc(100svh-57px-57px)] w-full">
        <ScrollArea className="h-full w-full">
          <Container className="max-w-xl py-6">
            {sessionHasEnded && (
              <>
                <div className="rounded-2xl border bg-card p-4 text-center">
                  <h2 className="text-lg font-bold">Session ended</h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    This Cyber Games session has ended. You can create a new
                    session or join another one.
                  </p>

                  <div className="mt-5 flex flex-col gap-2">
                    <CreateSessionDialog>
                      <Button className="h-10 w-full">Create a Session</Button>
                    </CreateSessionDialog>

                    <Button
                      variant="outline"
                      onClick={() => router.push(ROUTES.join_session)}
                      className="h-10"
                    >
                      Join a Session
                    </Button>
                  </div>
                </div>

                <Separator className="my-7" />
              </>
            )}

            {showPlayerStats && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border bg-card p-2">
                    <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                      Session
                    </p>
                    <p className="mt-1 text-sm font-bold">
                      {session?.join_code ?? "------"}
                    </p>
                  </div>

                  <div className="rounded-lg border bg-card p-2">
                    <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                      Score
                    </p>
                    <p className="mt-1 text-sm font-bold">
                      {(player?.score ?? 0).toFixed(1)}
                    </p>
                  </div>

                  <div className="rounded-lg border bg-card p-2">
                    <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                      Progress
                    </p>
                    <p className="mt-1 text-sm font-bold">
                      {player?.games_completed?.length ?? 0}/10
                    </p>
                  </div>
                </div>

                <Separator className="my-7" />
              </>
            )}

            <div>{children}</div>
          </Container>
        </ScrollArea>
      </main>

      <footer className="w-full border-t">
        <Container className="flex h-14 items-center justify-between">
          <Link href={ROUTES.home}>
            <HomeIcon className="text-primary" />
          </Link>

          <Sheet open={openSidebar} onOpenChange={setOpenSidebar}>
            <SheetTrigger>
              <Gamepad2Icon className="h-7 w-7 text-primary" />
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader className="gap-0">
                <SheetTitle></SheetTitle>
                <SheetDescription></SheetDescription>
                <Link
                  href={ROUTES.home}
                  className="flex items-center gap-1 text-xl font-semibold"
                >
                  <Image
                    src="/images/logo-v3.png"
                    alt="Cyber Games logo"
                    width={36}
                    height={36}
                    className="h-9 w-9 object-contain"
                  />
                  <span>CyberGames</span>
                </Link>
              </SheetHeader>

              <ScrollArea className="h-[calc(100%-68px)] w-full">
                <div className="flex flex-col gap-1.5 p-4">
                  {session?.id && player?.id ? (
                    GAME_LINKS.map((link) => (
                      <Link
                        key={link.id}
                        href={`${link.href}?sessionId=${session.id}&playerId=${player.id}`}
                        onClick={() => setOpenSidebar(false)}
                        className="rounded-md border px-2 py-1.5"
                      >
                        {link.label}
                      </Link>
                    ))
                  ) : (
                    <p className="rounded-md border bg-muted/40 px-2 py-3 text-sm text-muted-foreground">
                      Join a session to view games.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <Link
            href={`${ROUTES.leader_board}?sessionId=${sessionId}&playerId=${playerId}`}
          >
            <Trophy className="text-primary" />
          </Link>
        </Container>
      </footer>
    </>
  )
}
