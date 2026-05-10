import { Container } from "./container"

export const Footer = () => {
  return (
    <footer className="border-t">
      <Container className="flex flex-col items-center justify-between gap-6 pt-4 pb-6 lg:h-14 lg:flex-row">
        <p className="text-center text-sm text-muted-foreground">
          Cyber Games — making cybersecurity learning playful, competitive, and
          beginner-friendly.
        </p>

        {/* <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Cyber Games. All rights reserved.
        </p> */}
        <p className="text-center text-xs text-muted-foreground">
          Built by Emmanuel Obeto.
        </p>
      </Container>
    </footer>
  )
}
