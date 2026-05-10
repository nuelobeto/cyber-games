import Image from "next/image"
import Link from "next/link"
import { Container } from "./container"
// import { MenuIcon } from "lucide-react"
// import { Button } from "../ui/button"
import { ROUTES } from "@/lib/constants"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"

export const Topbar = () => {
  return (
    <nav className="fixed top-0 left-0 z-50 w-screen border-b bg-background">
      <Container className="flex h-14 items-center justify-between">
        <Link
          href={ROUTES.home}
          className="flex items-center gap-1 text-xl font-semibold"
        >
          <Image
            src="/images/logo-v3.png"
            alt="Cyber Games logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <span>CyberGames</span>
        </Link>

        {/* <MenuDropdown /> */}

        {/* <ul className="hidden items-center gap-12 text-sm font-medium sm:flex">
          {PAGE_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul> */}
      </Container>
    </nav>
  )
}

// const MenuDropdown = () => {
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="ghost" size="icon-sm" className="sm:hidden">
//           <MenuIcon />
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end">
//         <DropdownMenuGroup>
//           <DropdownMenuItem>Home</DropdownMenuItem>
//           <DropdownMenuItem>About</DropdownMenuItem>
//         </DropdownMenuGroup>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }
