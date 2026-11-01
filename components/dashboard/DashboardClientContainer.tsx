'use client'

import React from 'react'
import {
  ClientContainerProps,
  useDashboardClientState,
  DashboardHeader,
  DashboardKpiCards,
  DashboardChartsSection,
  DashboardStoreOnlineCard,
  DashboardQuickMetricsCard,
  DashboardSuggestionBanner,
  DashboardSmartInbox,
  DashboardRecentActivity,
  DashboardModals,
  QuickActionCard,
} from './client'

export { QuickActionCard }
export type { SmartInboxAlert, ActiveChat, DashboardStats } from './client'

export default function DashboardClientContainer(props: ClientContainerProps) {
  const {
    storeUrl,
    storeName,
    stats,
    chartData,
    productsCount = 0,
    isSubscribed = false,
  } = props

  const {
    copied,
    showQrModal,
    setShowQrModal,
    showWhatsAppModal,
    setShowWhatsAppModal,
    loadingStripe,
    showQuickActions,
    setShowQuickActions,
    showSuggestionBanner,
    setShowSuggestionBanner,
    showAllAlertsModal,
    setShowAllAlertsModal,
    activities,
    whatsappConnected,
    qrCodeBase64,
    loadingQr,
    activeAlerts,
    handleStripeRedirect,
    handleCopyLink,
    handleConnectWhatsApp,
    handleDownloadReport,
  } = useDashboardClientState(props)

  return (
    <div className="space-y-4.5">
      {/* Header Actions */}
      <DashboardHeader
        storeName={storeName}
        showQuickActions={showQuickActions}
        setShowQuickActions={setShowQuickActions}
        onDownloadReport={handleDownloadReport}
      />

      {/* Main 3-Column Layout Flexbox */}
      <div className="flex flex-col xl:flex-row gap-5 items-start w-full">
        {/* CENTER/LEFT COLUMN: Primary Dashboard Contents */}
        <div className="flex-grow flex-shrink flex-1 min-w-0 space-y-5 w-full">
          {/* Bento Grid Row 1: KPI Cards */}
          <DashboardKpiCards stats={stats} />

          {/* Row 2: Charts Side-by-side */}
          <DashboardChartsSection stats={stats} chartData={chartData} />

          {/* Row 3: Bento cards (Tu tienda online + Métricas rápidas side-by-side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <DashboardStoreOnlineCard
              storeUrl={storeUrl}
              storeName={storeName}
              copied={copied}
              onCopyLink={handleCopyLink}
              onOpenQrModal={() => setShowQrModal(true)}
            />
            <DashboardQuickMetricsCard
              productsCount={productsCount}
              isSubscribed={isSubscribed}
              loadingStripe={loadingStripe}
              onStripeRedirect={handleStripeRedirect}
            />
          </div>

          {/* Row 4: Sugerencia para ti banner */}
          <DashboardSuggestionBanner
            show={showSuggestionBanner}
            onClose={() => setShowSuggestionBanner(false)}
            whatsappConnected={whatsappConnected}
            onConnectWhatsApp={() => {
              setShowWhatsAppModal(true)
              handleConnectWhatsApp()
            }}
          />
        </div>

        {/* RIGHT COLUMN: Bandeja Inteligente & Actividad Reciente */}
        <div className="w-full xl:w-80 shrink-0 space-y-5">
          <DashboardSmartInbox
            activeAlerts={activeAlerts}
            onOpenWhatsAppModal={() => {
              setShowWhatsAppModal(true)
              handleConnectWhatsApp()
            }}
            onShowAllAlerts={() => setShowAllAlertsModal(true)}
          />

          <DashboardRecentActivity activities={activities} />
        </div>
      </div>

      {/* Modals */}
      <DashboardModals
        showQrModal={showQrModal}
        onCloseQrModal={() => setShowQrModal(false)}
        storeUrl={storeUrl}
        storeName={storeName}
        showWhatsAppModal={showWhatsAppModal}
        onCloseWhatsAppModal={() => setShowWhatsAppModal(false)}
        loadingQr={loadingQr}
        qrCodeBase64={qrCodeBase64}
        onConnectWhatsApp={handleConnectWhatsApp}
        showAllAlertsModal={showAllAlertsModal}
        onCloseAllAlertsModal={() => setShowAllAlertsModal(false)}
        activeAlerts={activeAlerts}
      />
    </div>
  )
}
