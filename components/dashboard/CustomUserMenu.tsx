"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings } from "lucide-react"

export default function CustomUserMenu() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()

  if (!isLoaded || !user) {
    return <div className="w-8 h-8 rounded-full bg-zinc-100 animate-pulse border border-zinc-200 flex-shrink-0" />
  }

  const primaryEmail = user.primaryEmailAddress?.emailAddress

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none shrink-0" asChild>
        <Avatar className="w-8 h-8 border border-zinc-200 ring-2 ring-zinc-50 hover:ring-zinc-200 transition-all cursor-pointer">
          <AvatarImage src={user.imageUrl} alt={user.fullName || "User Profile"} />
          <AvatarFallback className="bg-zinc-100 text-zinc-600 text-xs font-semibold">
            {user.firstName?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[220px] p-3 bg-white border shadow-md rounded-xl z-50 flex flex-col gap-1 text-zinc-950">
        <DropdownMenuLabel className="font-medium p-0">
          <div className="flex flex-col">
            <div className="px-2 py-0 font-medium text-sm text-zinc-900">{user.fullName}</div>
            <div className="px-2 py-0 font-medium text-xs text-zinc-500 truncate">{primaryEmail}</div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-zinc-100" />
        
        <div className="flex flex-col gap-1">
          <DropdownMenuItem asChild className="relative flex items-center gap-2 px-2 py-2 text-sm cursor-pointer rounded-xl text-zinc-500 transition-colors ease-in-out hover:text-zinc-900 hover:bg-zinc-100 focus:bg-zinc-100 focus:text-zinc-900 font-medium outline-none">
            <Link href="/productos" className="w-full">
              Enlaces de Pago
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="relative flex items-center gap-2 px-2 py-2 text-sm cursor-pointer rounded-xl text-zinc-500 transition-colors ease-in-out hover:text-zinc-900 hover:bg-zinc-100 focus:bg-zinc-100 focus:text-zinc-900 font-medium outline-none">
            <Link href="/configuracion" className="w-full">
              Ajustes de cuenta
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-zinc-100" />
        
        <DropdownMenuItem 
          onClick={() => signOut({ redirectUrl: '/' })} 
          className="relative flex items-center gap-2 px-2 py-2 text-sm cursor-pointer rounded-xl text-red-600 transition-colors ease-in-out hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700 font-medium outline-none"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
