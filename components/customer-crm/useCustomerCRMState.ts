'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { CustomerRecord, SerializedOrder } from './types'

export type SortMode = 'recent' | 'ltv' | 'intent'

export function useCustomerCRMState(
  initialCustomers: CustomerRecord[],
  initialOrders: SerializedOrder[]
) {
  const [customers, setCustomers] = useState<CustomerRecord[]>(initialCustomers)
  const [orders] = useState<SerializedOrder[]>(initialOrders)

  // Filters, Search & Sort
  const [search, setSearch] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [sortBy, setSortBy] = useState<SortMode>('recent')
  const [showAllHistory, setShowAllHistory] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Detail panel state
  const [selectedCustomerKey, setSelectedCustomerKey] = useState<string | null>(
    initialCustomers.length > 0 ? initialCustomers[0].customerKey : null
  )

  // Filter & Sort logic
  const filteredCustomers = customers
    .filter(c => {
      const q = search.toLowerCase()
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.intentDetail.toLowerCase().includes(q)

      const matchesSegment = segmentFilter === 'Todos' || c.segment === segmentFilter
      const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter

      return matchesSearch && matchesSegment && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'ltv') return b.totalSpent - a.totalSpent
      if (sortBy === 'intent') return b.intentAmount - a.intentAmount
      return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
    })

  useEffect(() => {
    setCurrentPage(1)
  }, [search, segmentFilter, statusFilter, sortBy])

  // Pagination bounds
  const totalPages = Math.max(Math.ceil(filteredCustomers.length / itemsPerPage), 1)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage)

  const activeCustomer = customers.find(c => c.customerKey === selectedCustomerKey) || null

  // Customer orders for purchase history
  const activeCustomerOrders = activeCustomer
    ? orders.filter(
        o =>
          o.customerKey === activeCustomer.customerKey ||
          (activeCustomer.phone && o.customerPhone.endsWith(activeCustomer.phone.slice(-10)))
      )
    : []
  const visibleCustomerOrders = showAllHistory
    ? activeCustomerOrders
    : activeCustomerOrders.slice(0, 6)
  const activeAverageTicket =
    activeCustomer && activeCustomer.paidOrders > 0
      ? Math.round(activeCustomer.totalSpent / activeCustomer.paidOrders)
      : activeCustomer?.intentAmount || 0
  const hasActiveFilters =
    search.trim() !== '' || segmentFilter !== 'Todos' || statusFilter !== 'Todos'

  const handleClearFilters = () => {
    setSearch('')
    setSegmentFilter('Todos')
    setStatusFilter('Todos')
    setCurrentPage(1)
  }

  useEffect(() => {
    setShowAllHistory(false)
  }, [selectedCustomerKey])

  // Edit existing customer notes/profile state (no manual customer creation)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editBirthDate, setEditBirthDate] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleStartEdit = () => {
    if (!activeCustomer) return
    setEditName(activeCustomer.name)
    setEditPhone(activeCustomer.phone)
    setEditEmail(activeCustomer.email)
    setEditBirthDate(activeCustomer.birthDate)
    setEditCity(activeCustomer.city)
    setEditNotes(activeCustomer.notes)
    setIsEditing(true)
  }

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeCustomer) return

    setIsSaving(true)
    try {
      const cleanPhone = editPhone.replace(/\D/g, '')
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeCustomer.id,
          phone: cleanPhone || activeCustomer.phone,
          name: editName.trim(),
          email: editEmail.trim(),
          birthDate: editBirthDate.trim(),
          city: editCity.trim(),
          notes: editNotes.trim(),
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || 'Error al guardar')
      const savedCustomer = data?.customer as { id?: string; phone?: string | null } | undefined

      setCustomers(prev =>
        prev.map(c => {
          if (c.customerKey === activeCustomer.customerKey) {
            return {
              ...c,
              id: savedCustomer?.id || c.id,
              phone: savedCustomer?.phone || cleanPhone || c.phone,
              name: editName.trim(),
              email: editEmail.trim(),
              birthDate: editBirthDate.trim(),
              city: editCity.trim(),
              notes: editNotes.trim(),
            }
          }
          return c
        })
      )

      setIsEditing(false)
      toast.success('Ficha del cliente actualizada')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Ocurrió un error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportCsv = () => {
    const headers = [
      'Cliente',
      'WhatsApp',
      'Email',
      'Ciudad',
      'Clasificación',
      'Compras Pagadas',
      'Total Pagado (COP)',
      'Intentos sin Pagar',
      'Monto en Intención (COP)',
      'Detalle Intención',
      'Última Actividad',
      'Notas',
    ]
    const rows = customers.map(c => [
      c.name,
      c.phone ? `+${c.phone}` : '',
      c.email,
      c.city,
      c.segment === 'Intención' ? 'Intención de compra' : c.segment,
      c.paidOrders,
      c.totalSpent,
      c.intentOrders,
      c.intentAmount,
      c.intentDetail,
      new Date(c.lastOrderDate).toLocaleDateString('es-CO'),
      c.notes,
    ])

    const csvContent =
      '\uFEFF' +
      [
        headers.join(','),
        ...rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')),
      ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Clientes_e_Intenciones_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Reporte de clientes e intenciones exportado en CSV')
  }

  // Metrics Calculations (Paid Buyers vs Purchase Intent)
  const totalUniqueCustomers = customers.length
  const paidCustomersCount = customers.filter(c => c.paidOrders > 0).length
  const intentCustomersCount = customers.filter(c => c.paidOrders === 0).length
  const totalLtvSum = customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const totalIntentSum = customers.reduce((sum, c) => sum + c.intentAmount, 0)
  const avgLtv = paidCustomersCount > 0 ? Math.round(totalLtvSum / paidCustomersCount) : 0
  const repeatCustomersCount = customers.filter(c => c.paidOrders >= 2).length
  const repeatRate =
    paidCustomersCount > 0
      ? Math.round((repeatCustomersCount / paidCustomersCount) * 100)
      : 0

  const segmentCounts = {
    Todos: customers.length,
    Frecuente: customers.filter(c => c.segment === 'Frecuente').length,
    Comprador: customers.filter(c => c.segment === 'Comprador').length,
    Intención: customers.filter(c => c.segment === 'Intención').length,
  }

  return {
    customers,
    search,
    setSearch,
    segmentFilter,
    setSegmentFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    segmentCounts,
    showAllHistory,
    setShowAllHistory,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    selectedCustomerKey,
    setSelectedCustomerKey,
    filteredCustomers,
    totalPages,
    startIndex,
    paginatedCustomers,
    activeCustomer,
    activeCustomerOrders,
    visibleCustomerOrders,
    activeAverageTicket,
    hasActiveFilters,
    handleClearFilters,
    isEditing,
    setIsEditing,
    editName,
    setEditName,
    editPhone,
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
    handleStartEdit,
    handleSaveCustomer,
    handleExportCsv,
    totalUniqueCustomers,
    paidCustomersCount,
    intentCustomersCount,
    totalLtvSum,
    totalIntentSum,
    avgLtv,
    repeatCustomersCount,
    repeatRate,
  }
}
