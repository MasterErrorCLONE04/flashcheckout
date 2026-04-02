import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''

if (!accessToken) {
  console.warn('MERCADOPAGO_ACCESS_TOKEN no está configurado en .env')
}

export const mpClient = new MercadoPagoConfig({
  accessToken,
  options: { timeout: 10000 },
})

export const mpPreference = new Preference(mpClient)
export const mpPayment = new Payment(mpClient)
