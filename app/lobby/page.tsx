"use client"

import { Topbar } from "@/components/layout/topbar"
import { useRouter, useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Edit3Icon, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field"
import { Container } from "@/components/layout/container"
import { useEffect, useState } from "react"
import { IUpdatePlayer } from "@/types"
import { useUpdatePlayerMutation } from "@/hooks/useMutation"
import { getSessionRedirectPath } from "@/lib/session-routing"
import {
  usePlayer,
  usePlayersBySession,
  useSession,
} from "@/hooks/useSubscriptions"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AVATARS, FIRST_AVATAR } from "@/lib/constants"
import { Footer } from "@/components/layout/footer"

const formSchema = z.object({
  username: z.string().min(3, "Bug title must be at least 5 characters."),
})

export default function Lobby() {
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const sessionId = searchParams.get("sessionId") ?? ""
  const playerId = searchParams.get("playerId") ?? ""

  const { data: session } = useSession(sessionId)
  const { data: player } = usePlayer(playerId)
  const { data: players, isLoading: loadingPlayers } =
    usePlayersBySession(sessionId)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  const { mutate: updatePlayer, status: updatePlayerStatus } =
    useUpdatePlayerMutation()

  const isUpdatingPlayer = updatePlayerStatus === "pending"

  function handleAvatarUpdate(avatar: string) {
    if (!player?.id) return

    const payload: IUpdatePlayer = {
      player_id: player.id,
      avatar,
    }

    updatePlayer(payload, {
      onSuccess: () => {
        toast.success("Avatar updated.")
        setAvatarDialogOpen(false)
      },
    })
  }

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (!player?.id) return

    const payload: IUpdatePlayer = {
      player_id: player.id,
      username: data.username,
    }

    updatePlayer(payload, {
      onSuccess: () => {
        toast.success("Username updated.")
      },
    })
  }

  useEffect(() => {
    if (!player?.username) return

    form.setValue("username", player.username)
  }, [player, form])

  useEffect(() => {
    if (!session) return
    if (!player) return

    if (session.status === "active") {
      const redirectPath = getSessionRedirectPath({
        session,
        player,
      })

      router.push(redirectPath)
    }
  }, [session, player, router])

  return (
    <>
      <header className="pt-[57px]">
        <Topbar />
      </header>

      <main className="flex min-h-[calc(100vh-57px)] flex-col py-12">
        <section>
          <Container className="flex max-w-xl flex-col items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" />
              <h1>Waiting for game to start...</h1>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center gap-2">
              <div className="rounded-full border border-primary p-1.5">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={player?.avatar || FIRST_AVATAR} />
                  <AvatarFallback>
                    {(player?.username || "CG").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <Dialog
                open={avatarDialogOpen}
                onOpenChange={setAvatarDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    Edit Avatar <Edit3Icon />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader className="hidden">
                    <DialogTitle></DialogTitle>
                    <DialogDescription></DialogDescription>
                  </DialogHeader>

                  <div className="mt-8 grid grid-cols-3 gap-3">
                    {AVATARS.map((avatar) => {
                      const isSelected = player?.avatar === avatar

                      return (
                        <button
                          key={avatar}
                          type="button"
                          disabled={isUpdatingPlayer}
                          onClick={() => handleAvatarUpdate(avatar)}
                          className={`rounded-2xl border p-1.5 transition ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "hover:border-primary/60"
                          }`}
                        >
                          <Image
                            src={avatar}
                            alt="Avatar option"
                            width={100}
                            height={100}
                            className="block aspect-square w-full rounded-xl object-cover"
                          />
                        </button>
                      )
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <form
              id="username-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-6 flex w-full items-center gap-2"
            >
              <FieldGroup>
                <Controller
                  name="username"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-0">
                      <Input
                        {...field}
                        id="username"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter a username"
                        autoComplete="off"
                      />
                      <FieldDescription>{/*  */}</FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              <Button
                type="submit"
                form="username-form"
                disabled={isUpdatingPlayer}
                className="w-[53.27px]"
              >
                {isUpdatingPlayer ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </form>
          </Container>
        </section>

        <section className="py-12">
          <Container className="max-w-xl">
            <h2 className="text-xl font-bold">Players</h2>

            <div className="mt-4 rounded-3xl border bg-card p-4">
              {loadingPlayers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {players.map((player, index) => (
                    <div
                      key={player.id}
                      className="flex flex-col items-center justify-center gap-2"
                    >
                      <div className="rounded-2xl border p-1.5">
                        <Image
                          src={player.avatar || FIRST_AVATAR}
                          alt=""
                          width={100}
                          height={100}
                          className="block aspect-square w-full rounded-xl"
                        />
                      </div>

                      <p className="rounded-sm border bg-neutral-800 px-2.5 py-1 text-xs font-medium">
                        {player.username || `Player-${index + 1}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  )
}
