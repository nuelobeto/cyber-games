/* eslint-disable react-hooks/incompatible-library */
"use client"

import { Container } from "@/components/layout/container"
import { Footer } from "@/components/layout/footer"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useJoinSessionMutation } from "@/hooks/useMutation"
import { useSessionByCodeQuery } from "@/hooks/useQuery"
import { IJoinSession } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef } from "react"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { getSessionRedirectPath } from "@/lib/session-routing"

const formSchema = z.object({
  code: z
    .string()
    .min(6, "Code must be 6 characters.")
    .max(6, "Code must be 6 characters."),
})

export default function JoinSession() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasAutoJoinedRef = useRef(false)

  const codeFromParams = searchParams.get("code") ?? ""

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  })

  const watchedCode = form.watch("code")

  const {
    data: session,
    isLoading: isLoadingSession,
    isError: isSessionError,
  } = useSessionByCodeQuery(watchedCode)

  const { mutate: joinSessionMutation, status: joinSessionStatus } =
    useJoinSessionMutation()

  const isJoining = joinSessionStatus === "pending"

  const handleJoinSession = useCallback(
    (joinCode: string) => {
      const payload: IJoinSession = {
        join_code: Number(joinCode),
      }

      joinSessionMutation(payload, {
        onSuccess: async (player) => {
          if (!session) return

          const redirectPath = getSessionRedirectPath({
            session,
            player,
          })

          router.push(redirectPath)
        },
      })
    },
    [joinSessionMutation, router, session]
  )

  function onSubmit(data: z.infer<typeof formSchema>) {
    handleJoinSession(data.code)
  }

  useEffect(() => {
    if (!codeFromParams) return

    form.setValue("code", codeFromParams)

    if (codeFromParams.length !== 6) return
    if (hasAutoJoinedRef.current) return
    if (!session) return

    hasAutoJoinedRef.current = true
    handleJoinSession(codeFromParams)
  }, [codeFromParams, form, handleJoinSession, session])

  return (
    <>
      <header className="pt-[57px]">
        <Topbar />
      </header>

      <main>
        <section className="min-h-svh lg:min-h-[calc(100vh-57px)]">
          <Container className="flex items-center justify-center py-20">
            <Card className="w-full sm:max-w-md">
              <CardHeader>
                <CardTitle>Join Session</CardTitle>
                <CardDescription>
                  Enter the 6-digit session code to join the Cyber Games lobby.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form
                  id="join-session-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FieldGroup>
                    <Controller
                      name="code"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="code">Session Code</FieldLabel>

                          <InputOTP
                            maxLength={6}
                            id="code"
                            required
                            value={field.value}
                            onChange={field.onChange}
                            disabled={isJoining}
                          >
                            <InputOTPGroup className="grid w-full grid-cols-6">
                              <InputOTPSlot
                                index={0}
                                className="h-12 w-full text-xl"
                              />
                              <InputOTPSlot
                                index={1}
                                className="h-12 w-full text-xl"
                              />
                              <InputOTPSlot
                                index={2}
                                className="h-12 w-full text-xl"
                              />
                              <InputOTPSlot
                                index={3}
                                className="h-12 w-full text-xl"
                              />
                              <InputOTPSlot
                                index={4}
                                className="h-12 w-full text-xl"
                              />
                              <InputOTPSlot
                                index={5}
                                className="h-12 w-full text-xl"
                              />
                            </InputOTPGroup>
                          </InputOTP>

                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </FieldGroup>
                </form>

                {watchedCode.length === 6 && isLoadingSession && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Checking session...
                  </p>
                )}

                {watchedCode.length === 6 && isSessionError && (
                  <p className="mt-4 text-sm text-destructive">
                    Invalid or unavailable session code.
                  </p>
                )}

                {session && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Session found. Status:{" "}
                    <span className="font-medium text-foreground">
                      {session.status}
                    </span>
                  </p>
                )}
              </CardContent>

              <CardFooter>
                <Field orientation="horizontal">
                  <Button
                    type="submit"
                    form="join-session-form"
                    className="w-full"
                    disabled={isJoining || isLoadingSession || !session}
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      "Join Session"
                    )}
                  </Button>
                </Field>
              </CardFooter>
            </Card>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  )
}
