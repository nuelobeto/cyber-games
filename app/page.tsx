"use client"

import { CreateSessionDialog } from "@/components/features/createSessionDialog"
import { Container } from "@/components/layout/container"
import { Footer } from "@/components/layout/footer"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <>
      <header className="pt-[57px]">
        <Topbar />
      </header>

      <main>
        <section className="min-h-svh lg:min-h-[calc(100vh-57px-57px)]">
          <Container className="flex flex-col gap-x-12 gap-y-12 py-12 lg:flex-row">
            <div className="flex flex-1 flex-col sm:items-center lg:items-start lg:pt-12">
              <h1 className="max-w-3xl text-3xl font-bold sm:text-center sm:text-5xl lg:text-left">
                Learn cybersecurity through live arcade-style challenges.
              </h1>
              <p className="mt-4 max-w-2xl leading-7 text-muted-foreground sm:text-center lg:text-left">
                Cyber Games turns beginner cybersecurity lessons into fast,
                competitive sessions where players join with a code, answer
                challenges, earn points, and climb the leaderboard.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center md:mt-12 lg:justify-start">
                <CreateSessionDialog>
                  <Button className="h-11 w-full sm:w-[200px]">
                    Create a Session
                  </Button>
                </CreateSessionDialog>
                <Button
                  className="h-11 sm:w-[200px]"
                  variant="outline"
                  onClick={() => router.push(ROUTES.join_session)}
                >
                  Join a Session
                </Button>
              </div>
            </div>
            <div className="w-full overflow-hidden rounded-3xl border border-primary lg:max-w-[500px]">
              <Image
                src="/images/hero-image.png"
                alt="Cyber Games cybersecurity arcade arena"
                width={900}
                height={900}
                priority
                className="block w-full object-cover"
              />
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  )
}
