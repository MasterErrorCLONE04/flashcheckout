"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col bg-zinc-50/50 selection:bg-black selection:text-white font-sans overflow-x-hidden">
      {/* Centered Logo for Identity */}
      <header className="flex items-center justify-center gap-2 px-8 py-4">
        <Link href="/">
          <svg width="24" height="24" viewBox="0 0 740 109" fill="none" strokeWidth="1.3333333333333333" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" className="h-7 w-auto aspect-[740/109]">
            <title>Flashcheckouts</title>
            <rect width="109" height="109" fill="#09090B" rx="28" />
            <path fill="white" d="M84.5 46.5H66.9a12 12 0 0 0-1-4 9.1 9.1 0 0 0-5.5-5 13 13 0 0 0-4.5-.8c-3 0-5.4.7-7.4 2.1-2 1.4-3.6 3.5-4.6 6.1-1 2.7-1.5 5.9-1.5 9.6 0 4 .5 7.2 1.5 9.9 1.1 2.6 2.6 4.6 4.6 6 2 1.3 4.4 2 7.3 2 1.6 0 3-.3 4.3-.7 1.2-.4 2.3-1 3.3-1.8 1-.7 1.7-1.7 2.3-2.8.6-1 1-2.3 1.2-3.7l17.6.1a24 24 0 0 1-2.3 8.3 27 27 0 0 1-14.5 13.5 32.5 32.5 0 0 1-12.3 2.2c-5.9 0-11.2-1.3-15.8-3.8a27.5 27.5 0 0 1-11-11.2c-2.8-4.9-4.1-10.9-4.1-18 0-7.2 1.4-13.2 4.1-18 2.8-5 6.5-8.7 11.1-11.2a35.8 35.8 0 0 1 26.8-2.1c3.4 1 6.4 2.7 9 4.8a24 24 0 0 1 6.2 7.8c1.5 3.1 2.5 6.7 2.8 10.7Z" />
            <mask id="flashcheckout-logo-mask-auth-v3" width="44" height="66" x="21" y="23" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }}>
              <path fill="#A1A1AA" d="M41.5 23 51 37.5 62.5 71 65 87l-31.5 2L21 71l3.5-35 17-13Z" />
            </mask>
            <g mask="url(#flashcheckout-logo-mask-auth-v3)">
              <path fill="#B2AEB9" opacity="1" d="M84.5 46.5H66.9a12 12 0 0 0-1-4 9.1 9.1 0 0 0-5.5-5 13 13 0 0 0-4.5-.8c-3 0-5.4.7-7.4 2.1-2 1.4-3.6 3.5-4.6 6.1-1 2.7-1.5 5.9-1.5 9.6 0 4 .5 7.2 1.5 9.9 1.1 2.6 2.6 4.6 4.6 6 2 1.3 4.4 2 7.3 2 1.6 0 3-.3 4.3-.7 1.2-.4 2.3-1 3.3-1.8 1-.7 1.7-1.7 2.3-2.8.6-1 1-2.3 1.2-3.7l17.6.1a24 24 0 0 1-2.3 8.3 27 27 0 0 1-14.5 13.5 32.5 32.5 0 0 1-12.3 2.2c-5.9 0-11.2-1.3-15.8-3.8a27.5 27.5 0 0 1-11-11.2c-2.8-4.9-4.1-10.9-4.1-18 0-7.2 1.4-13.2 4.1-18 2.8-5 6.5-8.7 11.1-11.2a35.8 35.8 0 0 1 26.8-2.1c3.4 1 6.4 2.7 9 4.8a24 24 0 0 1 6.2 7.8c1.5 3.1 2.5 6.7 2.8 10.7Z" />
            </g>
            <text x="135" y="82" fontFamily="Inter, system-ui, sans-serif" fontSize="78" fontWeight="400" fill="#09090B" style={{ letterSpacing: '-3px' }}>Flashcheckouts</text>
          </svg>
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <footer className="flex items-center justify-center gap-2 px-8 py-4">
        <p className="text-paragraph-3 text-sm">© 2026 Flashcheckouts, inc.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
