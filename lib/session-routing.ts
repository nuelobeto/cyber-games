import { ROUTES, TOTAL_GAMES } from "@/lib/constants"
import { IPlayer, ISession } from "@/types"

export const getNextGameId = (player?: IPlayer | null) => {
  const completedGamesCount = player?.games_completed?.length ?? 0
  const nextGameNumber = completedGamesCount + 1

  if (nextGameNumber > TOTAL_GAMES) {
    return null
  }

  return `game-${nextGameNumber}`
}

export const getSessionRedirectPath = ({
  session,
  player,
}: {
  session: ISession
  player?: IPlayer | null
}) => {
  if (session.status === "waiting") {
    return `${ROUTES.lobby}?sessionId=${session.id}&playerId=${player?.id}`
  }

  if (session.status === "active") {
    const nextGameId = getNextGameId(player)

    if (!nextGameId) {
      return `${ROUTES.leader_board}?sessionId=${session.id}&playerId=${player?.id}`
    }

    return `${ROUTES.game(nextGameId)}?sessionId=${session.id}&playerId=${player?.id}`
  }

  return `${ROUTES.leader_board}?sessionId=${session.id}&playerId=${player?.id}`
}
