"use client"

import { Dashboard } from "@/components/layout/dashboard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePlayersBySession } from "@/hooks/useSubscriptions"
import { FIRST_AVATAR, TOTAL_GAMES } from "@/lib/constants"
import { Trophy } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function LeaderBoard() {
  const searchParams = useSearchParams()

  const sessionId = searchParams.get("sessionId") ?? ""

  const { data: players, isLoading } = usePlayersBySession(sessionId)

  const rankedPlayers = [...players].sort((a, b) => {
    return (b.score ?? 0) - (a.score ?? 0)
  })

  return (
    <Dashboard>
      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
            <Trophy className="size-5 text-primary" />
          </div>

          <div>
            <h1 className="text-xl font-bold">Leaderboard</h1>
            <p className="text-sm text-muted-foreground">
              Final Cyber Games ranking for this session.
            </p>
          </div>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="rounded-2xl border bg-background p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Loading leaderboard...
              </p>
            </div>
          ) : rankedPlayers.length === 0 ? (
            <div className="rounded-2xl border bg-background p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No players found for this session.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rankedPlayers.map((player, index) => {
                const rank = index + 1
                const username = player.username || `Player-${rank}`
                const avatar = player.avatar || FIRST_AVATAR
                const completedGames = player.games_completed?.length ?? 0

                return (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 rounded-2xl border bg-background p-3"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-card text-sm font-bold">
                      #{rank}
                    </div>

                    <Avatar className="size-11">
                      <AvatarImage src={avatar} />
                      <AvatarFallback>
                        {username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{username}</p>
                      <p className="text-xs text-muted-foreground">
                        {completedGames}/{TOTAL_GAMES} games completed
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {(player.score ?? 0).toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Dashboard>
  )
}
