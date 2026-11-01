'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'
import {
  StoreWizardProps,
  useStoreWizardState,
  WizardProGate,
  WizardHeader,
  WizardNavigationFooter,
  WizardLivePreview,
  Step1Welcome,
  Step2BusinessInfo,
  Step3WhatsAppConnect,
  Step4Products,
  Step5Payments,
  Step6Preferences,
  Step7Review,
  Step8Launch
} from './store-wizard'

export default function StoreCreationWizard({
  isNewStore = false,
  isPro = false,
  hasExistingStores = false
}: StoreWizardProps) {
  const wizard = useStoreWizardState(isNewStore)

  // Upgrade to Pro Gate
  if (isNewStore && !isPro && hasExistingStores) {
    return <WizardProGate />
  }

  if (wizard.initializing) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-zinc-950" />
          <span className="text-xs text-zinc-400 font-bold tracking-wider">Cargando Onboarding...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col bg-white overflow-hidden font-sans text-left selection:bg-zinc-900 selection:text-white">
      {/* 1. TOP HEADER */}
      <WizardHeader
        currentStep={wizard.currentStep}
        currentStepData={wizard.currentStepData}
      />

      {/* 2. SPLIT-SCREEN MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: ACTIVE STEP FORM (54%) */}
        <div className="flex-1 lg:w-[54%] xl:w-[52%] flex flex-col justify-between overflow-y-auto custom-scrollbar border-r border-zinc-200/80 bg-white">
          <div className="flex-1 p-6 md:p-10 lg:p-12 max-w-2xl mx-auto w-full flex flex-col justify-center">
            {/* Step Metadata Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200/60">
                Paso {wizard.currentStep} de 8 • {wizard.currentStepData.category}
              </span>
              {wizard.currentStep > 1 && wizard.currentStep !== 8 && (
                <span className="text-[11px] text-zinc-400 font-semibold">
                  {Math.round((wizard.currentStep / 8) * 100)}% completado
                </span>
              )}
            </div>

            {/* STEP ROUTER */}
            {wizard.currentStep === 1 && <Step1Welcome />}
            {wizard.currentStep === 2 && <Step2BusinessInfo wizard={wizard} />}
            {wizard.currentStep === 3 && <Step3WhatsAppConnect wizard={wizard} />}
            {wizard.currentStep === 4 && <Step4Products wizard={wizard} />}
            {wizard.currentStep === 5 && <Step5Payments wizard={wizard} />}
            {wizard.currentStep === 6 && <Step6Preferences wizard={wizard} />}
            {wizard.currentStep === 7 && <Step7Review wizard={wizard} />}
            {wizard.currentStep === 8 && <Step8Launch wizard={wizard} />}
          </div>

          {/* BOTTOM PERSISTENT NAVIGATION BAR */}
          <WizardNavigationFooter wizard={wizard} />
        </div>

        {/* RIGHT COLUMN: DYNAMIC LIVE WHATSAPP & STORE PREVIEW (46%) */}
        <WizardLivePreview wizard={wizard} />
      </div>
    </div>
  )
}
