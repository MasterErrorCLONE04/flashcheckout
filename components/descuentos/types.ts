export type CouponEstado = 'Activo' | 'Programado' | 'Inactivo'
export type CouponTipo = 'Código' | 'Automático'
export type CouponTipoDesc = 'Porcentaje' | 'Envío gratis' | 'Monto fijo'
export type TabId = 'Todas' | 'Activas' | 'Programadas' | 'Inactivas'

export type Coupon = {
  id: string
  code: string
  desc: string
  tipo: CouponTipo
  tipoDesc: CouponTipoDesc
  valor: string
  validoHasta: string
  estado: CouponEstado
  usos: number
}
