'use client'

import { useState } from 'react'
import { X, Building2, Save, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'

type ExploreStoreB2BConfigModalProps = {
  isOpen: boolean
  onClose: () => void
  store?: any
  onSaved?: () => void
}

export default function ExploreStoreB2BConfigModal({
  isOpen,
  onClose,
  store,
  onSaved,
}: ExploreStoreB2BConfigModalProps) {
  if (!isOpen) return null

  const settings = (store?.settings as Record<string, any>) || {}

  const [form, setForm] = useState({
    location: settings.location || 'Zhejiang, CN',
    yearsActive: settings.yearsActive || '8 años',
    staffCount: settings.staffCount || '50+ personal',
    factoryArea: settings.factoryArea || '11,000+ m²',
    revenueStat: settings.revenueStat || 'COP67 M+',
    rating: settings.rating || 5.0,
    reviewCount: settings.reviewCount || 6,
    capabilities: Array.isArray(settings.capabilities)
      ? settings.capabilities.join(', ')
      : 'Personalización completa, Servicio ODM disponible, Experiencia en exportación global',
    certifications: Array.isArray(settings.certifications)
      ? settings.certifications.join(', ')
      : 'UK CA, CE',
    factoryGallery: Array.isArray(settings.factoryGallery)
      ? settings.factoryGallery.join(', ')
      : 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80, https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      const updatedSettings = {
        ...settings,
        location: form.location.trim(),
        yearsActive: form.yearsActive.trim(),
        staffCount: form.staffCount.trim(),
        factoryArea: form.factoryArea.trim(),
        revenueStat: form.revenueStat.trim(),
        rating: Number(form.rating) || 5.0,
        reviewCount: Number(form.reviewCount) || 6,
        capabilities: form.capabilities
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        certifications: form.certifications
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        factoryGallery: form.factoryGallery
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      }

      const res = await fetch('/api/stores', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updatedSettings }),
      })

      if (res.ok) {
        setSuccess(true)
        if (onSaved) onSaved()
        setTimeout(() => {
          setSuccess(false)
          onClose()
          window.location.reload()
        }, 1200)
      } else {
        alert('Hubo un error al guardar los datos de tu tienda.')
      }
    } catch (err) {
      console.error('Error updating B2B store data:', err)
      alert('Error de conexión al guardar los datos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building2 className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Editar Perfil de Fábrica / Tienda B2B
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Personaliza la información que se muestra en el directorio de Flashcheckouts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
            <CheckCircle2 className="size-4 text-emerald-600" />
            ¡Perfil B2B actualizado con éxito! Recargando...
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Ubicación / País
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="Zhejiang, CN"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Años de Experiencia
              </label>
              <input
                type="text"
                value={form.yearsActive}
                onChange={(e) => setForm({ ...form, yearsActive: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="8 años"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Personal / Colaboradores
              </label>
              <input
                type="text"
                value={form.staffCount}
                onChange={(e) => setForm({ ...form, staffCount: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="50+ personal"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Área de Instalaciones
              </label>
              <input
                type="text"
                value={form.factoryArea}
                onChange={(e) => setForm({ ...form, factoryArea: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="11,000+ m²"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Ventas Estimadas
              </label>
              <input
                type="text"
                value={form.revenueStat}
                onChange={(e) => setForm({ ...form, revenueStat: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                placeholder="COP67 M+"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Calificación (1 - 5)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Total Reseñas
              </label>
              <input
                type="number"
                value={form.reviewCount}
                onChange={(e) => setForm({ ...form, reviewCount: Number(e.target.value) })}
                className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Capacidades de la fábrica (separadas por comas)
            </label>
            <input
              type="text"
              value={form.capabilities}
              onChange={(e) => setForm({ ...form, capabilities: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              placeholder="Personalización completa, Servicio ODM disponible, Experiencia en exportación global"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Certificaciones (separadas por comas)
            </label>
            <input
              type="text"
              value={form.certifications}
              onChange={(e) => setForm({ ...form, certifications: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              placeholder="UK CA, CE, ISO 9001"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Fotos del taller / Fábrica (URLs separadas por comas)
            </label>
            <textarea
              rows={2}
              value={form.factoryGallery}
              onChange={(e) => setForm({ ...form, factoryGallery: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              placeholder="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158, https://images.unsplash.com/photo-1581092335397"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-zinc-300 dark:border-white/20 px-5 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  <span>Guardar cambios</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
