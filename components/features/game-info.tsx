"use client"

import { Button } from "../ui/button"

interface Props {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  gameName: string
  gameInfo: string
}

export const GameInfo = ({ setOpen, gameName, gameInfo }: Props) => {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <h1 className="text-xl font-bold">{gameName}</h1>

      <p className="mt-2 text-sm text-muted-foreground">{gameInfo}</p>

      <Button size="lg" className="mt-6 w-full" onClick={() => setOpen(false)}>
        Play Game
      </Button>
    </div>
  )
}
