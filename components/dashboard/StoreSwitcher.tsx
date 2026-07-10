"use client"

import { useState } from "react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { ChevronsUpDown, Store, Plus, Check, ExternalLink } from "lucide-react"
import Link from "next/link"

type StoreItem = {
  id: string
  name: string
  slug: string
}

export default function StoreSwitcher({
  stores,
  activeStore
}: {
  stores: StoreItem[]
  activeStore: StoreItem
}) {
  const [open, setOpen] = useState(false)

  const handleSwitch = (storeId: string) => {
    // Save to cookies and reload
    document.cookie = `active_store_id=${storeId}; path=/; max-age=31536000`
    document.cookie = `create_new_store=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC` // Clear create new store cookie
    window.location.reload()
  }

  const handleCreateNew = () => {
    document.cookie = `create_new_store=true; path=/; max-age=3600` // 1 hour expiration
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="outline-none" asChild>
          <button className="flex max-w-[200px] items-center justify-start gap-1.5 rounded-lg px-2 py-1.5 font-bold text-foreground text-xs transition-colors hover:bg-zinc-100 select-none border border-zinc-200 bg-white">
            <Store className="size-3.5 text-zinc-500 shrink-0" />
            <span className="truncate max-w-[100px]">{activeStore.name}</span>
            <ChevronsUpDown className="size-3 shrink-0 text-muted-foreground opacity-55" />
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-[230px] p-2 bg-white border border-zinc-200 shadow-lg rounded-xl z-50 flex flex-col gap-1 text-zinc-950">
          <DropdownMenuLabel className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1">
            Mis Tiendas / Workspaces
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="-mx-2 my-1 h-px bg-zinc-100" />
          
          <div className="flex flex-col gap-0.5 max-h-[200px] overflow-y-auto">
            {stores.map((s) => {
              const isActive = s.id === activeStore.id
              return (
                <button
                  key={s.id}
                  onClick={() => handleSwitch(s.id)}
                  className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold rounded-lg text-left transition-colors hover:bg-zinc-100 focus:bg-zinc-100 outline-none text-zinc-700"
                >
                  <span className="truncate mr-2">{s.name}</span>
                  {isActive && <Check className="size-3.5 text-emerald-500 shrink-0" />}
                </button>
              )
            })}
          </div>
          
          <DropdownMenuSeparator className="-mx-2 my-1 h-px bg-zinc-100" />
          
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 w-full px-2 py-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-left transition-colors outline-none"
          >
            <Plus className="size-3.5 shrink-0" />
            <span>Crear nueva tienda</span>
          </button>
        </DropdownMenuContent>
      </DropdownMenu>

      <Link 
        href={`/tienda/${activeStore.slug}`} 
        target="_blank"
        className="flex items-center justify-center size-7 hover:bg-zinc-100 rounded-md transition-colors"
        title="Ver tienda en vivo"
      >
        <ExternalLink className="size-3.5 text-zinc-400 hover:text-zinc-600 transition-colors" />
      </Link>
    </div>
  )
}
