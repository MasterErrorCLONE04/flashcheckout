import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0066CC_0.01,transparent_0.5)] pointer-events-none opacity-[0.03]" />
      <SignIn
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            formButtonPrimary:
              'bg-black hover:bg-zinc-800 text-xs font-bold uppercase tracking-widest h-12 rounded-full transition-all active:scale-95 shadow-xl',
            card: 'shadow-2xl border-none p-8 rounded-[2.5rem]',
            headerTitle: 'text-2xl font-semibold tracking-tight text-black uppercase',
            headerSubtitle: 'text-[10px] font-bold uppercase tracking-widest text-zinc-400',
            socialButtonsBlockButton: 'rounded-2xl border-black/[0.05] hover:bg-zinc-50 transition-all',
            socialButtonsBlockButtonText: 'text-[10px] font-bold uppercase tracking-widest text-zinc-400',
            dividerLine: 'bg-black/[0.03]',
            dividerText: 'text-[10px] font-bold uppercase tracking-widest text-zinc-200',
            formFieldLabel: 'text-[10px] font-bold uppercase tracking-widest text-zinc-400',
            formFieldInput: 'rounded-2xl border-black/[0.05] bg-zinc-50/50 focus:bg-white focus:ring-primary/20 transition-all h-12 text-sm',
            footerActionText: 'text-[10px] font-bold uppercase tracking-widest text-zinc-400',
            footerActionLink: 'text-[10px] font-bold uppercase tracking-widest text-primary hover:text-black transition-colors',
          },
        }}
      />
    </div>
  )
}
