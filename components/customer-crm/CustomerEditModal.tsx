'use client'

import Modal from '@/components/ui/Modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
        <div className="space-y-1.5">
          <label className="block text-zinc-600">Nombre completo</label>
          <Input
            type="text"
            required
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-zinc-600">Correo electrónico</label>
          <Input
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-zinc-600">Fecha de nacimiento</label>
          <Input
            type="text"
            placeholder="Ej. 9 de septiembre, 1989"
            value={editBirthDate}
            onChange={(e) => setEditBirthDate(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-zinc-600">Ciudad</label>
          <Input
            type="text"
            value={editCity}
            onChange={(e) => setEditCity(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-zinc-600">Notas de fidelidad / Observaciones</label>
          <textarea
            rows={3}
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 outline-none text-sm text-zinc-900 font-normal resize-none leading-relaxed"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-2.5">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
