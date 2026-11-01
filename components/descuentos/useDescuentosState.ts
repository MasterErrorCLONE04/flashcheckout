'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Coupon, CouponEstado, CouponTipo, CouponTipoDesc, TabId } from './types'

export function useDescuentosState() {
  const [mounted, setMounted] = useState(false)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('Todas')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEstado, setFilterEstado] = useState('Todos')
  const [filterTipo, setFilterTipo] = useState('Todos')
  const [filterTipoDesc, setFilterTipoDesc] = useState('Todos')

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState(8)
  const [currentPage, setCurrentPage] = useState(1)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form Fields
  const [code, setCode] = useState('')
  const [desc, setDesc] = useState('')
  const [tipo, setTipo] = useState<CouponTipo>('Código')
  const [tipoDesc, setTipoDesc] = useState<CouponTipoDesc>('Porcentaje')
  const [valorNum, setValorNum] = useState('')
  const [validoHasta, setValidoHasta] = useState('')
  const [estado, setEstado] = useState<CouponEstado>('Activo')

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/coupons')
      const data = await res.json()
      if (res.ok) {
        setCoupons(data.coupons || [])
      } else {
        toast.error('Error al cargar descuentos')
      }
    } catch {
      toast.error('Error de conexión al cargar descuentos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchCoupons()
  }, [])

  const openCreateModal = () => {
    setEditingId(null)
    setCode('')
    setDesc('')
    setValorNum('')
    setValidoHasta('')
    setEstado('Activo')
    setIsModalOpen(true)
  }

  const openEditModal = (c: Coupon) => {
    setEditingId(c.id)
    setCode(c.code)
    setDesc(c.desc)
    setTipo(c.tipo)
    setTipoDesc(c.tipoDesc)
    setValorNum(c.valor.replace(/[^0-9]/g, ''))
    setValidoHasta(c.validoHasta === 'Sin fecha límite' ? '' : c.validoHasta)
    setEstado(c.estado)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      toast.error('El código es requerido')
      return
    }

    let finalValor = ''
    if (tipoDesc === 'Porcentaje') {
      if (!valorNum) {
        toast.error('El porcentaje es requerido')
        return
      }
      finalValor = `${valorNum}% Descuento`
    } else if (tipoDesc === 'Envío gratis') {
      finalValor = '$0 Envío'
    } else if (tipoDesc === 'Monto fijo') {
      if (!valorNum) {
        toast.error('El monto es requerido')
        return
      }
      const formatted = Number(valorNum).toLocaleString('es-CO')
      finalValor = `$${formatted} Descuento`
    }

    try {
      setFormLoading(true)
      const url = '/api/coupons'
      const method = editingId ? 'PUT' : 'POST'
      const body = {
        id: editingId || undefined,
        code: code.trim(),
        desc,
        tipo,
        tipoDesc,
        valor: finalValor,
        validoHasta: validoHasta || 'Sin fecha límite',
        estado
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast.success(editingId ? 'Descuento actualizado exitosamente' : 'Descuento creado exitosamente')
        setIsModalOpen(false)
        setEditingId(null)
        setCode('')
        setDesc('')
        setValorNum('')
        setValidoHasta('')
        setEstado('Activo')
        fetchCoupons()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al procesar el descuento')
      }
    } catch {
      toast.error('Error al conectar con el servidor')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este descuento?')) return
    try {
      setIsDeleting(id)
      const res = await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Descuento eliminado')
        fetchCoupons()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al eliminar')
      }
    } catch {
      toast.error('Error de red al eliminar')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleToggleStatus = async (coupon: Coupon) => {
    const newEstado = coupon.estado === 'Activo' ? 'Inactivo' : 'Activo'
    try {
      const res = await fetch('/api/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: coupon.id,
          estado: newEstado
        })
      })
      if (res.ok) {
        toast.success(`Descuento ${newEstado === 'Activo' ? 'activado' : 'desactivado'}`)
        fetchCoupons()
      } else {
        toast.error('Error al actualizar el estado')
      }
    } catch {
      toast.error('Error de red al actualizar')
    }
  }

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(coupons, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", "descuentos.json")
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // Filter Logic
  const filteredCoupons = coupons.filter(c => {
    if (activeTab === 'Activas' && c.estado !== 'Activo') return false
    if (activeTab === 'Programadas' && c.estado !== 'Programado') return false
    if (activeTab === 'Inactivas' && c.estado !== 'Inactivo') return false

    const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.desc.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false

    if (filterEstado !== 'Todos' && c.estado !== filterEstado) return false
    if (filterTipo !== 'Todos' && c.tipo !== filterTipo) return false
    if (filterTipoDesc !== 'Todos' && c.tipoDesc !== filterTipoDesc) return false

    return true
  })

  // Pagination Logic
  const totalPages = Math.ceil(filteredCoupons.length / rowsPerPage)
  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  // Stat Counters
  const totalCount = coupons.length
  const activeCount = coupons.filter(c => c.estado === 'Activo').length
  const scheduledCount = coupons.filter(c => c.estado === 'Programado').length
  const inactiveCount = coupons.filter(c => c.estado === 'Inactivo').length
  const totalUses = coupons.reduce((sum, c) => sum + c.usos, 0)

  // Chart data calculations
  const pctCount = coupons.filter(c => c.tipoDesc === 'Porcentaje').length
  const freeShipCount = coupons.filter(c => c.tipoDesc === 'Envío gratis').length
  const fixedCount = coupons.filter(c => c.tipoDesc === 'Monto fijo').length

  const pctPercent = totalCount > 0 ? Math.round((pctCount / totalCount) * 100) : 0
  const freeShipPercent = totalCount > 0 ? Math.round((freeShipCount / totalCount) * 100) : 0
  const fixedPercent = totalCount > 0 ? Math.round((fixedCount / totalCount) * 100) : 0

  const mostUsedCoupon = coupons.length > 0 
    ? [...coupons].sort((a, b) => b.usos - a.usos)[0]
    : null

  const mostUsedPercent = totalUses > 0 && mostUsedCoupon
    ? Math.round((mostUsedCoupon.usos / totalUses) * 100)
    : 0

  return {
    mounted,
    coupons,
    loading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filterEstado,
    setFilterEstado,
    filterTipo,
    setFilterTipo,
    filterTipoDesc,
    setFilterTipoDesc,
    rowsPerPage,
    setRowsPerPage,
    currentPage,
    setCurrentPage,
    isModalOpen,
    setIsModalOpen,
    formLoading,
    isDeleting,
    editingId,
    code,
    setCode,
    desc,
    setDesc,
    tipo,
    setTipo,
    tipoDesc,
    setTipoDesc,
    valorNum,
    setValorNum,
    validoHasta,
    setValidoHasta,
    estado,
    setEstado,
    filteredCoupons,
    totalPages,
    paginatedCoupons,
    totalCount,
    activeCount,
    scheduledCount,
    inactiveCount,
    totalUses,
    pctCount,
    freeShipCount,
    fixedCount,
    pctPercent,
    freeShipPercent,
    fixedPercent,
    mostUsedCoupon,
    mostUsedPercent,
    openCreateModal,
    openEditModal,
    handleSubmit,
    handleDelete,
    handleToggleStatus,
    handleExport,
  }
}
