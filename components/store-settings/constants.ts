import { ScheduleDay } from './types'

export const TABS = [
  { id: 'general', label: 'General' },
  { id: 'pagos', label: 'Pagos' },
] as const

export type TabId = typeof TABS[number]['id']

export const SCHEDULE_DAYS: ScheduleDay[] = [
  { key: 'lunes',    label: 'Lunes',    from: '7:00 a. m.', to: '8:00 p. m.', enabled: true },
  { key: 'martes',   label: 'Martes',   from: '7:00 a. m.', to: '8:00 p. m.', enabled: true },
  { key: 'miercoles',label: 'Miércoles',from: '7:00 a. m.', to: '8:00 p. m.', enabled: true },
  { key: 'jueves',   label: 'Jueves',   from: '7:00 a. m.', to: '8:00 p. m.', enabled: true },
  { key: 'viernes',  label: 'Viernes',  from: '7:00 a. m.', to: '9:00 p. m.', enabled: true },
  { key: 'sabado',   label: 'Sábado',   from: '8:00 a. m.', to: '9:00 p. m.', enabled: true },
  { key: 'domingo',  label: 'Domingo',  from: '8:00 a. m.', to: '6:00 p. m.', enabled: true },
]

export const PREFERENCE_FIELDS = [
  {
    label: 'Idioma',
    key: 'language' as const,
    options: [
      { value: 'es', label: 'Español' },
      { value: 'en', label: 'English' },
    ]
  },
  {
    label: 'Moneda',
    key: 'currency' as const,
    options: [
      { value: 'COP', label: 'Peso colombiano (COP)' },
      { value: 'USD', label: 'Dólar Americano (USD)' },
      { value: 'MXN', label: 'Peso Mexicano (MXN)' },
      { value: 'EUR', label: 'Euro (EUR)' },
    ]
  },
  {
    label: 'Zona horaria',
    key: 'timezone' as const,
    options: [
      { value: 'GMT-05:00', label: '(GMT-5) Bogotá, Lima, Quito' },
      { value: 'GMT-06:00', label: '(GMT-6) Ciudad de México' },
      { value: 'GMT-04:00', label: '(GMT-4) Caracas, La Paz' },
      { value: 'GMT-03:00', label: '(GMT-3) Buenos Aires' },
    ]
  },
  {
    label: 'Formato de fecha',
    key: 'dateFormat' as const,
    options: [
      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    ]
  },
]
