import api from "@/services"
import {
  ICreateSession,
  IJoinSession,
  IUpdatePlayer,
  IUpdateSessionStatus,
} from "@/types"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export const useCreateSessionMutation = () => {
  return useMutation({
    mutationFn: (payload: ICreateSession) => {
      return api.createSession(payload)
    },
    onSuccess: () => {
      toast.success("Session created.")
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Unable to create session."

      toast.error(message)
    },
  })
}

export const useJoinSessionMutation = () => {
  return useMutation({
    mutationFn: (payload: IJoinSession) => {
      return api.joinSession(payload)
    },
    onSuccess: () => {
      toast.success("Joined session.")
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Unable to join session."

      toast.error(message)
    },
  })
}

export const useUpdateSessionStatusMutation = () => {
  return useMutation({
    mutationFn: (payload: IUpdateSessionStatus) => {
      return api.updateSessionStatus(payload)
    },
    onSuccess: (_, payload) => {
      toast.success(`Session ${payload.status}.`)
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update session status."

      toast.error(message)
    },
  })
}

export const useUpdatePlayerMutation = () => {
  return useMutation({
    mutationFn: (payload: IUpdatePlayer) => {
      return api.updatePlayer(payload)
    },
    // onSuccess: () => {
    //   toast.success("Player updated.")
    // },
    // onError: (error) => {
    //   const message =
    //     error instanceof Error ? error.message : "Unable to update player."

    //   toast.error(message)
    // },
  })
}
