import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button isolate md:[isolation:auto] relative inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-xs font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none cursor-pointer focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-']):not([class*='w-'])]:size-3.5",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-950 text-white border-zinc-900 hover:bg-zinc-800 shadow-xs",
        outline:
          "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300 shadow-xs",
        secondary:
          "bg-zinc-100 text-zinc-800 hover:bg-zinc-200/80 border-zinc-200/60",
        ghost:
          "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
        destructive:
          "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 focus-visible:ring-red-500/20",
        emerald:
          "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-xs",
        link: "text-zinc-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-2 px-3.5",
        xs: "h-7 gap-1 px-2.5 text-[11px] rounded-md [&_svg:not([class*='size-']):not([class*='w-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 text-xs rounded-lg",
        md: "h-10 gap-2 px-4 text-sm rounded-lg",
        lg: "h-12 gap-2 px-6 text-sm rounded-xl",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-']):not([class*='w-'])]:size-3",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
