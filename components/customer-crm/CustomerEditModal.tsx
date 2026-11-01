'use client'

import Modal from '@/components/ui/Modal'

interface CustomerEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  editName: string
  setEditName: (value: string) => void
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
  onClose,
  onSubmit,
  editName,
  setEditName,
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
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Perfil de Cliente">
      <form onSubmit={onSubmit} className="space-y-4 text-xs font-semibold text-zinc-700">
        <div className="space-y-1">
          <label className="block text-zinc-500">Nombre Completo</label>
          <input
            type="text"
            required
            value={editName}
            onChange={e => setEditName(e.target.value)}
            className="w-full h-9 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 focus:bg-white focus:border-zinc-300 outline-none text-zinc-805"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-zinc-500">Email</label>
          <input
            type="email"
            value={editEmail}
            onChange={e => setEditEmail(e.target.value)}
            className="w-full h-9 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 focus:bg-white focus:border-zinc-300 outline-none text-zinc-805"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-zinc-500">Fecha de Nacimiento</label>
          <input
            type="text"
            placeholder="e.g. 9 de Septiembre, 1989"
            value={editBirthDate}
            onChange={e => setEditBirthDate(e.target.value)}
            className="w-full h-9 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 focus:bg-white focus:border-zinc-300 outline-none text-zinc-805"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-zinc-500">Ciudad</label>
          <input
            type="text"
            value={editCity}
            onChange={e => setEditCity(e.target.value)}
            className="w-full h-9 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 focus:bg-white focus:border-zinc-300 outline-none text-zinc-805"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-zinc-500">Notas de fidelidad / Observaciones</label>
          <textarea
            rows={3}
            value={editNotes}
            onChange={e => setEditNotes(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 focus:bg-white focus:border-zinc-300 outline-none text-zinc-805 font-medium resize-none leading-relaxed"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-all cursor-pointer font-bold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="h-9 px-5 bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg transition-all disabled:opacity-50 cursor-pointer font-bold flex items-center justify-center gap-1.5"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

