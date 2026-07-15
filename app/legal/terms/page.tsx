'use client'

import React from 'react'
import Link from 'next/link'
import { Zap, ChevronLeft } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white text-zinc-800 font-sans selection:bg-zinc-150">
      {/* Mini navbar header */}
      <header className="border-b border-zinc-100 py-4.5 px-6 sticky top-0 bg-white/85 backdrop-blur-md z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group transition-all hover:opacity-80">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black text-xl shadow-sm">
              <Zap className="w-4.5 h-4.5 fill-white stroke-white" />
            </div>
            <span className="text-[19px] font-semibold tracking-tight text-zinc-900">FlashCheckout</span>
          </Link>
          
          <Link 
            href="/" 
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-950 transition-colors uppercase tracking-wider"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver a inicio
          </Link>
        </div>
      </header>

      {/* Main content body */}
      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        {/* Document Header */}
        <div className="border-b border-zinc-100 pb-10 mb-10">
          <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight leading-none mb-4">
            Terms of Service
          </h1>
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
            Última actualización: 15 de julio de 2026
          </p>
        </div>

        {/* Terms text content */}
        <div className="space-y-8 text-[14px] leading-relaxed text-zinc-650 font-normal">
          <p className="font-semibold text-zinc-700 tracking-wide uppercase leading-loose border-l-2 border-zinc-900 pl-4 py-1.5 bg-zinc-50/50 rounded-r-lg pr-4">
            THESE TERMS OF SERVICE (THE &quot;AGREEMENT&quot;) GOVERN YOUR RECEIPT, ACCESS TO, AND USE OF THE SERVICES PROVIDED BY FLASHCHECKOUT INC. (&quot;FLASHCHECKOUT&quot;). BY (A) PURCHASING ACCESS TO THE SERVICE THROUGH AN ONLINE ORDERING PROCESS THAT REFERENCES THIS AGREEMENT, (B) SIGNING UP FOR A FREE OR PAID ACCESS PLAN FOR THE SERVICE VIA A PLATFORM THAT REFERENCES THIS AGREEMENT, OR (C) CLICKING A BOX INDICATING ACCEPTANCE, YOU AGREE TO BE BOUND BY THE TERMS OF THIS AGREEMENT. THE INDIVIDUAL ACCEPTING THIS AGREEMENT DOES SO ON BEHALF OF A COMPANY OR OTHER LEGAL ENTITY (&quot;CUSTOMER&quot;); SUCH INDIVIDUAL REPRESENTS AND WARRANTS THAT THEY HAVE THE AUTHORITY TO BIND SUCH ENTITY AND ITS AFFILIATES TO THIS AGREEMENT. IF THE INDIVIDUAL ACCEPTING THIS AGREEMENT DOES NOT HAVE SUCH AUTHORITY, OR IF THE ENTITY DOES NOT AGREE WITH THESE TERMS AND CONDITIONS, SUCH INDIVIDUAL MUST NOT ACCEPT THIS AGREEMENT AND MAY NOT USE THE SERVICES. CAPITALIZED TERMS HAVE THE MEANINGS SET FORTH HEREIN. THE PARTIES AGREE AS FOLLOWS:
          </p>

          <div className="pt-4 border-t border-zinc-100">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-3">
              1. The Service
            </h2>
            
            <h3 className="text-[15px] font-bold text-zinc-800 mb-2">
              1.1 Service Description
            </h3>
            <p className="mb-4">
              FlashCheckout owns and provides a cloud-based artificial intelligence service offering agents for customer support, sales, and user engagement (the &quot;Service&quot;). Anything the Customer (including Users) configures, customizes, uploads, or otherwise utilizes through the Service is considered a &quot;User Submission.&quot; Customer is solely responsible for all User Submissions it contributes to the Service. Additional terms regarding User Submissions, including ownership, are in Section 8.2 below. The Service may include templates, scripts, documentation, and other materials that assist Customer in using the Service (&quot;FlashCheckout Content&quot;). Customers will not receive or have access to the underlying code or software of the Service (collectively, the &quot;Software&quot;) nor receive a copy of the Software.
            </p>

            <h3 className="text-[15px] font-bold text-zinc-800 mb-2">
              1.2 Access and Support
            </h3>
            <p>
              Subject to Customer&apos;s compliance with this Agreement and the applicable order process, FlashCheckout hereby grants Customer a non-exclusive, non-transferable, non-sublicensable right to access and use the Service during the applicable Term. FlashCheckout will provide standard support services to Customer in accordance with our standard support guidelines.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-100">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-3">
              2. Customer Responsibilities and Restrictions
            </h2>
            <p className="mb-4">
              Customer is solely responsible for all activities that occur under Customer&apos;s account. Customer agrees not to: (a) reverse engineer, decompile, disassemble, or otherwise attempt to discover the source code of the Software; (b) modify, translate, or create derivative works based on the Service; (c) sell, rent, lease, distribute, or otherwise transfer access to the Service to any third party; or (d) use the Service to transmit any malicious code, virus, or unauthorized data.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-100">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-3">
              3. Payment of Fees
            </h2>
            <p className="mb-4">
              Customer shall pay FlashCheckout all applicable fees for the selected pricing plans in accordance with the billing terms. If Customer upgrades their plan (e.g. from Free to Pro), the billing will adjust immediately and be charged through our connected gateway (Stripe or MercadoPago). All fees are non-refundable except as explicitly stated herein.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-100">
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-3">
              4. Term and Termination
            </h2>
            <p>
              This Agreement commences on the date Customer accepts it and continues until all access plans have expired or have been terminated. Either party may terminate this Agreement if the other party materially breaches any term and fails to cure such breach within thirty (30) days of receipt of written notice.
            </p>
          </div>

        </div>

        {/* Footer footer */}
        <div className="border-t border-zinc-100 mt-16 pt-8 flex items-center justify-between text-xs font-medium text-zinc-400 select-none">
          <span>© {new Date().getFullYear()} FlashCheckout Inc.</span>
          <Link href="/solutions/privacidad" className="hover:text-zinc-650 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </main>
    </div>
  )
}
