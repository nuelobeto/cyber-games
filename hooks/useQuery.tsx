"use client"

import api from "@/services"
import { useQuery } from "@tanstack/react-query"

export const queryKeys = {
  sessionByCode: (code: string) => ["session-by-code", code] as const,
}

export const useSessionByCodeQuery = (code: string) => {
  return useQuery({
    queryKey: queryKeys.sessionByCode(code),
    queryFn: () => api.getSessionByCode(Number(code)),
    enabled: code.length === 6,
    retry: false,
  })
}
