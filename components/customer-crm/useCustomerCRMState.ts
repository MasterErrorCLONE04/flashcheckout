'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { CustomerRecord, SerializedOrder } from './types'

export function useCustomerCRMState(
  initialCustomers: CustomerRecord[],
  initialOrders: SerializedOrder[]
) {
  const [customers, setCustomers] = useState<CustomerRecord[]>(initialCustomers)
  const [orders] = useState<SerializedOrder[]>(initialOrders)

  // Filters & Search
  const [search, setSearch] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [showAllHistory, setShowAllHistory] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Detail panel state
  const [selectedCustomerKey, setSelectedCustomerKey] = useState<string | null>(null)

  // Set default selection to first customer if available on load
  useEffect(() => {
    if (initialCustomers.length > 0 && !selectedCustomerKey) {
      setSelectedCustomerKey(initialCustomers[0].customerKey)
    }
  }, [initialCustomers, selectedCustomerKey])

  // Filter logic
  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())

    const matchesSegment = segmentFilter === 'Todos' || c.segment === segmentFilter
    const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter

    return matchesSearch && matchesSegment && matchesStatus
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [search, segmentFilter, statusFilter])

  // Pagination bounds
  const totalPages = Math.max(Math.ceil(filteredCustomers.length / itemsPerPage), 1)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage)

  const activeCustomer = customers.find(c => c.customerKey === selectedCustomerKey) || null

  // Customer orders for purchase history
  const activeCustomerOrders = activeCustomer
    ? orders.filter(o => o.customerKey === activeCustomer.customerKey)
    : []
  const visibleCustomerOrders = showAllHistory ? activeCustomerOrders : activeCustomerOrders.slice(0, 5)
  const activeAverageTicket =
    activeCustomer && activeCustomer.totalOrders > 0
      ? Math.round(activeCustomer.totalSpent / activeCustomer.totalOrders)
      : 0
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

  // Edit customer profile state
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editBirthDate, setEditBirthDate] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleStartEdit = () => {
    if (!activeCustomer) return
    setEditName(activeCustomer.name)
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
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeCustomer.id,
          phone: activeCustomer.phone,
          name: editName,
          email: editEmail,
          birthDate: editBirthDate,
          city: editCity,
          notes: editNotes,
        }),
      })

      if (!res.ok) throw new Error('Error al guardar')
      const data = await res.json()
      const savedCustomer = data.customer as { id?: string; phone?: string | null } | undefined

      setCustomers(prev =>
        prev.map(c => {
          if (c.customerKey === activeCustomer.customerKey) {
            return {
              ...c,
              id: savedCustomer?.id || c.id,
              phone: savedCustomer?.phone || c.phone,
              name: editName,
              email: editEmail,
              birthDate: editBirthDate,
              city: editCity,
              notes: editNotes,
            }
          }
          return c
        })
      )

      setIsEditing(false)
      toast.success('Información del cliente guardada con éxito')
    } catch (err) {
      console.error(err)
      toast.error('Ocurrió un error al guardar los cambios')
    } finally {
      setIsSaving(false)
    }
  }

  // Metrics Calculations (KPI cards derived with pure real database values)
  const totalUniqueCustomers = customers.length
  const active30Days = customers.filter(c => c.status === 'Activo').length
  const totalLtvSum = customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const avgLtv = customers.length > 0 ? Math.round(totalLtvSum / customers.length) : 0

  return {
    search,
    setSearch,
    segmentFilter,
    setSegmentFilter,
    statusFilter,
    setStatusFilter,
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
    totalUniqueCustomers,
    active30Days,
    totalLtvSum,
    avgLtv,
  }
}

