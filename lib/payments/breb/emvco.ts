export type BrebKeyType = 'PHONE' | 'EMAIL' | 'DOCUMENT' | 'ALPHANUMERIC' | 'MERCHANT_CODE'

export type BrebMerchantAccount = {
  gui: string
  participantId: string
  keyType: BrebKeyType
  keyValue: string
  keyTypeCode?: string
}

export type BrebPayloadInput = {
  merchantName: string
  amount: number
  reference: string
  merchantAccount: BrebMerchantAccount
  merchantCity?: string
}

const PAYLOAD_FORMAT_INDICATOR = '01'
const POINT_OF_INITIATION_DYNAMIC = '12'
const MERCHANT_CATEGORY_CODE_UNSPECIFIED = '0000'
const COP_CURRENCY_CODE = '170'
const COUNTRY_CODE_CO = 'CO'
const CRC_ID = '63'
const CRC_LENGTH = '04'
export const DEFAULT_BREB_EMVCO_GUI = 'co.com.ach.spi'

const BREB_KEY_TYPE_CODES: Record<BrebKeyType, string> = {
  ALPHANUMERIC: '01',
  PHONE: '02',
  EMAIL: '03',
  DOCUMENT: '04',
  MERCHANT_CODE: '05',
}

export function buildBrebEmvcoPayload(input: BrebPayloadInput) {
  validateBrebPayloadInput(input)

  const merchantAccount = buildMerchantAccountInformation(input.merchantAccount)
  const additionalData = tlv('01', sanitizeReference(input.reference))

  const payloadWithoutCrc = [
    tlv('00', PAYLOAD_FORMAT_INDICATOR),
    tlv('01', POINT_OF_INITIATION_DYNAMIC),
    tlv('26', merchantAccount),
    tlv('52', MERCHANT_CATEGORY_CODE_UNSPECIFIED),
    tlv('53', COP_CURRENCY_CODE),
    tlv('54', formatCopAmount(input.amount)),
    tlv('58', COUNTRY_CODE_CO),
    tlv('59', sanitizeMerchantName(input.merchantName)),
    tlv('60', sanitizeMerchantCity(input.merchantCity || 'COLOMBIA')),
    tlv('62', additionalData),
  ].join('')

  const crcInput = `${payloadWithoutCrc}${CRC_ID}${CRC_LENGTH}`
  return `${crcInput}${crc16CcittFalse(crcInput)}`
}

export function tlv(id: string, value: string) {
  if (!/^\d{2}$/.test(id)) {
    throw new Error(`Invalid EMVCo tag "${id}". Tags must be two digits.`)
  }

  const length = value.length
  if (length > 99) {
    throw new Error(`EMVCo tag "${id}" exceeds 99 characters.`)
  }

  return `${id}${String(length).padStart(2, '0')}${value}`
}

export function crc16CcittFalse(value: string) {
  let crc = 0xffff

  for (let i = 0; i < value.length; i += 1) {
    crc ^= value.charCodeAt(i) << 8

    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xffff
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0')
}

export function sanitizeMerchantName(value: string) {
  return sanitizeEmvText(value, 25) || 'COMERCIO'
}

export function sanitizeMerchantCity(value: string) {
  return sanitizeEmvText(value, 15) || 'COLOMBIA'
}

export function sanitizeReference(value: string) {
  return sanitizeEmvText(value, 25)
}

export function formatCopAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number.')
  }

  return amount.toFixed(2)
}

function buildMerchantAccountInformation(account: BrebMerchantAccount) {
  const fields = [
    tlv('00', sanitizeEmvText(account.gui, 32)),
    tlv('01', sanitizeBrebKey(account.keyValue, account.keyType)),
    tlv('02', sanitizeParticipantId(account.participantId)),
    tlv('03', sanitizeKeyTypeCode(account.keyTypeCode || BREB_KEY_TYPE_CODES[account.keyType])),
  ]

  return fields.join('')
}

function validateBrebPayloadInput(input: BrebPayloadInput) {
  if (!input.merchantAccount.gui.trim()) {
    throw new Error('Missing Bre-B EMVCo GUI. Configure BREB_EMVCO_GUI from the official participant spec.')
  }

  if (!input.merchantAccount.keyValue.trim()) {
    throw new Error('Missing Bre-B key value.')
  }

  if (!input.merchantAccount.participantId.trim()) {
    throw new Error('Missing Bre-B participant entity code.')
  }

  if (!sanitizeReference(input.reference)) {
    throw new Error('Missing payment reference.')
  }
}

function sanitizeBrebKey(value: string, keyType: BrebKeyType) {
  const trimmed = value.trim()

  if (keyType === 'PHONE') {
    const digits = trimmed.replace(/\D/g, '').slice(0, 30)
    return digits ? `@${digits}` : ''
  }

  if (keyType === 'DOCUMENT') {
    return trimmed.replace(/\D/g, '').slice(0, 30)
  }

  return sanitizeEmvText(trimmed, 50)
}

function sanitizeParticipantId(value: string) {
  return value.replace(/\D/g, '').slice(0, 10)
}

function sanitizeKeyTypeCode(value: string) {
  return value.replace(/\D/g, '').slice(0, 4).padStart(2, '0')
}

function sanitizeEmvText(value: string, maxLength: number) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 @._-]/g, '')
    .trim()
    .toUpperCase()
    .slice(0, maxLength)
}
