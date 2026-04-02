import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <SignIn
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            formButtonPrimary:
              'bg-emerald-600 hover:bg-emerald-700 text-sm normal-case',
            card: 'shadow-xl border border-emerald-100',
          },
        }}
      />
    </div>
  )
}
