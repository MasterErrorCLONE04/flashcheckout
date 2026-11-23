'use client'

import Modal from '@/components/ui/Modal'

interface CustomerEditModalProps {
  isOpen: boolean
  mode?: 'create' | 'edit'
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  editName: string
  setEditName: (value: string) => void
  editPhone?: string
  setEditPhone?: (value: string) => void
  editEmail: string
  setEditEmail: (value: string) => void
  editBirthDate: string
  setEditBirthDate: (value: string) => void
  editCity: string
  setEditCity: (value: string) => void
  editNotes: string
  setEditNotes: (value: string) => void
  isSaving: boolean
}

export function CustomerEditModal({
  isOpen,
  mode = 'edit',
  onClose,
  onSubmit,
  editName,
  setEditName,
  editPhone = '',
  setEditPhone,
  editEmail,
  setEditEmail,
  editBirthDate,
  setEditBirthDate,
  editCity,
  setEditCity,
  editNotes,
  setEditNotes,
  isSaving,
}: CustomerEditModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Registrar Nuevo Cliente' : 'Editar Perfil de Cliente'}
    >
      <form onSubmit={onSubmit} className="space-y-3.5 text-xs font-semibold text-zinc-700 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-zinc-600">
              Nombre completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Carolina Gómez"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 text-xs font-semibold text-zinc-900 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-zinc-600">
              Teléfono WhatsApp
            </label>
            <input
              type="text"
              placeholder="Ej. 573001234567"
              value={editPhone}
              onChange={e => setEditPhone?.(e.target.value)}
              className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 text-xs font-semibold text-zinc-900 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-zinc-600">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="cliente@correo.com"
              value={editEmail}
              onChange={e => setEditEmail(e.target.value)}
              className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 text-xs font-semibold text-zinc-900 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-zinc-600">
              Ciudad / Ubicación
            </label>
            <input
              type="text"
              placeholder="Ej. Medellín, Bogotá"
              value={editCity}
              onChange={e => setEditCity(e.target.value)}
              className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 text-xs font-semibold text-zinc-900 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-zinc-600">
            Fecha de cumpleaños / Aniversario
          </label>
          <input
            type="text"
            placeholder="Ej. 14 de mayo"
            value={editBirthDate}
            onChange={e => setEditBirthDate(e.target.value)}
            className="w-full h-9 bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 text-xs font-semibold text-zinc-900 outline-none transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-zinc-600">
            Notas de fidelidad y preferencias
          </label>
          <textarea
            rows={3}
            placeholder="Tallas preferidas, direcciones frecuentes, preferencias de pago..."
            value={editNotes}
            onChange={e => setEditNotes(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-950 focus:bg-white rounded-xl px-3 py-2 text-xs text-zinc-900 font-medium outline-none resize-none leading-relaxed transition-all"
          />
        </div>

        <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="h-9 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
          >
            {isSaving
              ? 'Guardando...'
              : mode === 'create'
                ? 'Crear cliente'
                : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
