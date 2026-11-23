import { ScheduleDay } from './types'

export const TABS = [
  { id: 'general', label: 'Perfil & Sede' },
  { id: 'pagos', label: 'Cobros & Bre-B' },
  { id: 'notificaciones', label: 'Notificaciones' },
  { id: 'seguridad', label: 'Equipo & API' },
] as const

export type TabId = (typeof TABS)[number]['id']

export const SCHEDULE_DAYS: ScheduleDay[] = [
  { key: 'lunes', label: 'Lunes', from: '08:00', to: '20:00', enabled: true },
  { key: 'martes', label: 'Martes', from: '08:00', to: '20:00', enabled: true },
  { key: 'miercoles', label: 'Miércoles', from: '08:00', to: '20:00', enabled: true },
  { key: 'jueves', label: 'Jueves', from: '08:00', to: '20:00', enabled: true },
  { key: 'viernes', label: 'Viernes', from: '08:00', to: '21:00', enabled: true },
  { key: 'sabado', label: 'Sábado', from: '09:00', to: '21:00', enabled: true },
  { key: 'domingo', label: 'Domingo', from: '09:00', to: '18:00', enabled: true },
]

export const PREFERENCE_FIELDS = [
  {
    label: 'Idioma del panel',
    key: 'language' as const,
    options: [
      { value: 'es', label: 'Español (Latinoamérica)' },
      { value: 'en', label: 'English' },
    ],
  },
  {
    label: 'Moneda principal',
    key: 'currency' as const,
    options: [
      { value: 'COP', label: 'Peso colombiano (COP)' },
      { value: 'USD', label: 'Dólar Americano (USD)' },
      { value: 'MXN', label: 'Peso Mexicano (MXN)' },
      { value: 'EUR', label: 'Euro (EUR)' },
    ],
  },
  {
    label: 'Zona horaria',
    key: 'timezone' as const,
    options: [
      { value: 'GMT-05:00', label: '(GMT-5) Bogotá, Medellín, Lima' },
      { value: 'GMT-06:00', label: '(GMT-6) Ciudad de México' },
      { value: 'GMT-04:00', label: '(GMT-4) Santiago, Caracas' },
      { value: 'GMT-03:00', label: '(GMT-3) Buenos Aires' },
    ],
  },
  {
    label: 'Formato de fecha',
    key: 'dateFormat' as const,
    options: [
      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    ],
  },
]
