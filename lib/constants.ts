export const ROUTES = {
  home: "/",
  about: "/about",
  session_code: "/session-code",
  join_session: "/join-session",
  lobby: "/lobby",
  game: (game_id: string | number) => `/games/${game_id}`,
  leader_board: "/leader-board",
} as const

export const PAGE_LINKS = [
  {
    label: "Home",
    href: ROUTES.home,
  },
  {
    label: "About",
    href: ROUTES.about,
  },
] as const

export const TOTAL_GAMES = 10

export const AVATARS = [
  "/images/naruto.jpeg",
  "/images/yuji.jpeg",
  "/images/luffy.jpeg",
  "/images/zoro.jpeg",
  "/images/konan.jpeg",
  "/images/itachi.jpeg",
  "/images/tsunade.jpeg",
  "/images/madara.jpeg",
  "/images/gon.jpeg",
  "/images/levi.jpeg",
  "/images/sakamoto.jpeg",
  "/images/tanjiro.jpeg",
] as const

export const FIRST_AVATAR = AVATARS[0]

export const GAME_LINKS = [
  {
    id: "game-1",
    label: "Cyber Sort Rush",
    href: ROUTES.game("game-1"),
  },
  {
    id: "game-2",
    label: "Hacker Timeline Dash",
    href: ROUTES.game("game-2"),
  },
  {
    id: "game-3",
    label: "Identity Gate",
    href: ROUTES.game("game-3"),
  },
  {
    id: "game-4",
    label: "Scam Spotter",
    href: ROUTES.game("game-4"),
  },
  {
    id: "game-5",
    label: "Phish Link Hunter",
    href: ROUTES.game("game-5"),
  },
  {
    id: "game-6",
    label: "Web & Network Relay",
    href: ROUTES.game("game-6"),
  },
  {
    id: "game-7",
    label: "OWASP Shield Match",
    href: ROUTES.game("game-7"),
  },
  {
    id: "game-8",
    label: "Encryption Vault",
    href: ROUTES.game("game-8"),
  },
  {
    id: "game-9",
    label: "Human Firewall",
    href: ROUTES.game("game-9"),
  },
  {
    id: "game-10",
    label: "Attack Dodge Arena",
    href: ROUTES.game("game-10"),
  },
] as const
