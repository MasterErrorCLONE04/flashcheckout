import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export default function SSOCallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-black rounded-full animate-spin" />
        <p className="text-sm font-medium text-zinc-500">Conectando con tu cuenta...</p>
        <AuthenticateWithRedirectCallback 
          signInForceRedirectUrl="/dashboard"
          signUpForceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}
