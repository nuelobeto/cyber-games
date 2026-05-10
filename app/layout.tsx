import type { Metadata } from "next"
import { Geist_Mono, Oxanium } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { QueryProvider } from "./query-provider"
import { AppWrapper } from "@/components/layout/app-wrapper"

const oxanium = Oxanium({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Cyber Games",
    template: "%s | Cyber Games",
  },
  description:
    "Cyber Games is an interactive cybersecurity learning game that teaches beginners core security concepts through fun challenges, quizzes, and arcade-style mini games.",
  keywords: [
    "Cyber Games",
    "cybersecurity game",
    "cybersecurity learning",
    "cybersecurity for beginners",
    "web security",
    "network security",
    "phishing awareness",
    "cybersecurity education",
  ],
  authors: [
    {
      name: "Emmanuel Obeto",
    },
  ],
  creator: "Emmanuel Obeto",
  metadataBase: new URL("https://cybergames.app"),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        oxanium.variable
      )}
    >
      <body>
        <QueryProvider>
          <ThemeProvider>
            <AppWrapper>{children}</AppWrapper>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
