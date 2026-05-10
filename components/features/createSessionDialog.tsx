"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "../ui/button"
import { useCreateSessionMutation } from "@/hooks/useMutation"
import { ICreateSession } from "@/types"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/lib/constants"

interface Props {
  children: React.ReactNode
}

export const SESSION_DURATIONS = [
  { label: "10 minutes", value: 10 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "1 hour", value: 60 },
  { label: "1 hour 30 minutes", value: 90 },
  { label: "2 hours", value: 120 },
] as const

const formSchema = z.object({
  duration_in_minutes: z.string().min(1, "Please select a session duration."),
})

export const CreateSessionDialog = ({ children }: Props) => {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duration_in_minutes: "",
    },
  })

  const { mutate: createSessionMutation, status: createSessionStatus } =
    useCreateSessionMutation()

  function onSubmit(data: z.infer<typeof formSchema>) {
    const payload: ICreateSession = {
      duration_in_minutes: Number(data.duration_in_minutes),
    }

    createSessionMutation(payload, {
      onSuccess: (session) => {
        form.reset()
        setOpen(false)
        router.push(
          `${ROUTES.session_code}?sessionId=${session.id}&code=${session.join_code}`
        )
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form id="create-session-form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a game session</DialogTitle>
            <DialogDescription>
              Choose how long this Cyber Games session should stay active.
              Players will join using a session code or QR link.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Controller
              name="duration_in_minutes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="session-duration">
                    Session Duration
                  </FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="session-duration"
                      aria-invalid={fieldState.invalid}
                      className="min-w-[120px]"
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent position="item-aligned">
                      {SESSION_DURATIONS.map((duration) => (
                        <SelectItem
                          key={duration.value}
                          value={String(duration.value)}
                        >
                          {duration.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form="create-session-form"
              className="sm:w-[80.74px]"
            >
              {createSessionStatus === "pending" ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Continue"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
