'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
      className="w-full px-0 md:px-8 md:bg-[linear-gradient(to_bottom,transparent_60%,black_40%)] lg:bg-[linear-gradient(to_bottom,transparent_50%,black_50%)]"
    >
      <div className="relative flex w-full flex-col items-center justify-center gap-6 overflow-hidden border-zinc-200 border-t bg-[length:100%_auto] bg-bottom bg-white bg-no-repeat px-6 py-12 pb-30 md:gap-8 md:rounded-3xl md:border md:p-15 lg:p-25">
        <div className="flex flex-col gap-4 md:max-w-[850px] md:gap-6 relative z-10">
          <h2 className="text-center font-medium text-4xl text-foreground leading-tight tracking-tighter md:text-balance md:text-5xl lg:text-[54px]">
            Haz que cada conversacion termine en una orden pagada
          </h2>
          <p className="text-center font-normal text-base text-zinc-600 tracking-[-0.4px] md:text-balance md:text-xl">
            Activa tu tienda, conecta tus productos, cobra por QR Bre-B o link seguro y opera tus pedidos desde un panel hecho para vender.
          </p>
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-6 md:gap-4 relative z-10">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="relative z-0 h-14 w-full md:w-fit group"
          >
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
            <Button asChild size="lg" className="relative h-full w-full bg-black text-white hover:bg-zinc-900 rounded-lg px-8">
              <Link href="/sign-up">Crear mi tienda gratis</Link>
            </Button>
          </motion.div>

          <div className="flex flex-row items-center gap-2 text-muted-foreground text-sm">
            <svg width="24" height="24" viewBox="0 0 16 17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M14.6615 6.50521H14.6577M14.6577 6.50521H1.33185M14.6577 6.50521C14.6615 6.78028 14.6615 7.08895 14.6615 7.43854V9.50521M14.6577 6.50521C14.6455 5.60514 14.5934 5.06481 14.3708 4.6279C14.1151 4.12613 13.7072 3.71819 13.2054 3.46252C12.635 3.17188 11.8883 3.17188 10.3948 3.17188H5.59479C4.10132 3.17188 3.35458 3.17188 2.78415 3.46252C2.28238 3.71819 1.87444 4.12613 1.61877 4.6279C1.39616 5.06481 1.34405 5.60514 1.33185 6.50521M1.33185 6.50521H1.32812M1.33185 6.50521C1.32812 6.78028 1.32812 7.08895 1.32812 7.43854V9.57188C1.32812 11.0653 1.32812 11.8121 1.61877 12.3825C1.87444 12.8843 2.28238 13.2922 2.78415 13.5479C3.35458 13.8385 4.10132 13.8385 5.59479 13.8385H8.10677M5.99479 9.17188H3.99479"></path>
              <path d="M11.2498 14.5786L12.6641 13.1644M12.6641 13.1644L14.0783 11.7502M12.6641 13.1644L11.2498 11.7502M12.6641 13.1644L14.0783 14.5786"></path>
            </svg>
            <p>Sin tarjeta de credito</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
