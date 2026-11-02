"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronsUpDown, Store, Plus, Check, ExternalLink, Lock, Sparkles } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { FREE_STORE_LIMIT, PRO_STORE_LIMIT } from "@/lib/store-limits"

type StoreItem = {
  id: string
  name: string
  slug: string
  category?: string | null
}

export default function StoreSwitcher({
  stores,
  activeStore,
  isPro = false,
}: {
  stores: StoreItem[]
  activeStore: StoreItem
  isPro?: boolean
}) {
  const [open, setOpen] = useState(false)
  const maxStores = isPro ? PRO_STORE_LIMIT : FREE_STORE_LIMIT

  const handleSwitch = (storeId: string) => {
    setOpen(false)
    if (storeId === activeStore.id) return
    document.cookie = `active_store_id=${storeId}; path=/; max-age=31536000`
    document.cookie = `create_new_store=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`
    window.location.reload()
  }

  const handleCreateNew = () => {
    setOpen(false)
    if (!isPro) {
      toast.error("Plan Gratuito: 1 negocio incluido", {
        description: "Actualiza a Plan Pro para crear múltiples negocios independientes con páginas autogeneradas.",
      })
      window.location.href = "/pricing"
      return
    }

    if (stores.length >= maxStores) {
      toast.error("Límite de negocios alcanzado", {
        description: `Has creado los ${maxStores} negocios incluidos en tu cuenta Pro.`,
      })
      return
    }

    document.cookie = `create_new_store=true; path=/; max-age=3600`
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="outline-none" asChild>
          <button
            type="button"
            className="flex max-w-[220px] items-center justify-start gap-1.5 rounded-lg px-2.5 py-1.5 font-bold text-foreground text-xs transition-colors hover:bg-zinc-100 select-none border border-zinc-200 bg-white cursor-pointer"
          >
            <Store className="size-3.5 text-zinc-500 shrink-0" />
            <span className="truncate max-w-[125px]">{activeStore.name}</span>
            <ChevronsUpDown className="size-3 shrink-0 text-muted-foreground opacity-55" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="w-[265px] p-2 bg-white border border-zinc-200 shadow-lg rounded-xl z-50 flex flex-col gap-1 text-zinc-950"
        >
          <DropdownMenuLabel className="flex items-center justify-between px-2 py-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Mis Negocios
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 tabular-nums">
              {isPro ? `${stores.length}/${maxStores} Pro` : `${stores.length}/${FREE_STORE_LIMIT} Gratis`}
            </span>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="-mx-2 my-1 h-px bg-zinc-100" />

          <div className="flex flex-col gap-0.5 max-h-[220px] overflow-y-auto">
            {stores.map((s) => {
              const isActive = s.id === activeStore.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSwitch(s.id)}
                  className="flex items-center justify-between w-full px-2.5 py-2 text-xs rounded-lg text-left transition-colors hover:bg-zinc-100 focus:bg-zinc-100 outline-none cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-zinc-900 truncate leading-tight">{s.name}</div>
                    <div className="text-[10px] font-medium text-zinc-400 truncate mt-0.5">
                      {s.category ? `${s.category} · ` : ""}/tienda/{s.slug}
                    </div>
                  </div>
                  {isActive && <Check className="size-3.5 text-emerald-600 shrink-0" />}
                </button>
              )
            })}
          </div>

          <DropdownMenuSeparator className="-mx-2 my-1 h-px bg-zinc-100" />

          <button
            type="button"
            onClick={handleCreateNew}
            className="flex items-center justify-between w-full px-2.5 py-2 text-xs font-bold rounded-lg text-left transition-colors outline-none cursor-pointer hover:bg-zinc-50 text-zinc-900"
          >
            <span className="flex items-center gap-2">
              {isPro ? (
                <Plus className="size-3.5 text-emerald-600 shrink-0" />
              ) : (
                <Lock className="size-3.5 text-amber-500 shrink-0" />
              )}
              <span>Crear nuevo negocio</span>
            </span>
            {isPro ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                <Sparkles className="size-2.5" />
                IA
              </span>
            ) : (
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-zinc-950 text-white uppercase tracking-wider">
                Pro
              </span>
            )}
          </button>
        </DropdownMenuContent>
      </DropdownMenu>

      <Link
        href={`/tienda/${activeStore.slug}`}
        target="_blank"
        className="flex items-center justify-center size-7 hover:bg-zinc-100 rounded-md transition-colors"
        title="Ver página en vivo"
      >
        <ExternalLink className="size-3.5 text-zinc-400 hover:text-zinc-700 transition-colors" />
      </Link>
    </div>
  )
}
