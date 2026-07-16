# SmartPay Bre-B

## Objetivo

SmartPay Bre-B permite que cada tienda cobre directamente en su propia cuenta o deposito registrado con una Llave Bre-B. FlashCheckout no custodia, recauda ni dispersa fondos: solo genera la orden, el QR/intencion de cobro, recibe el comprobante y automatiza la validacion operativa.

## Principios

- El dinero siempre viaja del comprador al comercio.
- La configuracion Bre-B es multitenant por `storeId`.
- El payload EMVCo debe usar el spec oficial Bre-B/participante. No se deben inventar identificadores de red.
- Las capturas de comprobantes deben tratarse como datos sensibles y guardarse en storage privado.
- La aprobacion automatica requiere monto exacto, destino correcto, fecha fresca y transaccion no reutilizada.

## Fase 1: Base tecnica

- `BrebPaymentConfig`: Llave Bre-B, banco, comercio y estado de activacion por tienda.
- `BrebPaymentIntent`: referencia unica, monto, payload EMVCo, expiracion y estado por orden.
- `BrebPaymentProof`: resultado OCR, decision y deduplicacion por `extractedTransactionId`.
- Generador EMVCo con TLV y CRC16 CCITT-FALSE.
- Endpoint autenticado `/api/breb/config`.
- Endpoint publico-controlado `/api/breb/payment-intents`.

## Fase 2: SmartPay UI

- Mostrar QR Bre-B en `/pay/{orderId}` cuando la tienda tenga Bre-B activo.
- Agregar boton "Copiar Llave Bre-B" para pagos desde el mismo celular.
- Agregar upload de comprobante en la pantalla de pago.
- Polling corto a `/api/orders/status` hasta `PAID`, `MANUAL_REVIEW` o `REJECTED`.

## Fase 3: OCR antifraude

- Subir imagen a bucket privado.
- Enviar imagen a proveedor de vision/OCR.
- Extraer `bank_origin`, `destination_key`, `amount`, `transaction_id`, `datetime`, `is_success_screen`.
- Rechazar duplicados por `extractedTransactionId`.
- Aprobar automaticamente solo si todas las reglas pasan.

## Fase 4: WhatsApp

- Enviar link a `/pay/{orderId}` en el cierre del pedido.
- Opcional: enviar imagen QR directamente por WhatsApp si la integracion soporta media.
- Notificar al cliente y vendedor cuando el comprobante sea aprobado, rechazado o enviado a revision.

## Variables requeridas

- `BREB_EMVCO_GUI`: identificador del Merchant Account Information. El QR Bre-B de Nu observado usa `co.com.ach.spi`.
- `BREB_PROOF_WINDOW_MINUTES`: ventana maxima para aceptar comprobantes recientes. Por defecto: 10 minutos.

## Pendientes criticos

- Confirmar documentacion oficial EMVCo Bre-B antes de activar en produccion. El formato implementado usa la estructura observada en un QR real: `26 -> 00 co.com.ach.spi, 01 llave, 02 codigo entidad participante, 03 codigo tipo de llave`.
- QRs observados:
  - Nu: `participantId=3201`, llave alias `@NYL279`, tipo `01`.
  - Nequi: `participantId=1507`, llave celular `@3025382862`, tipo `02`.
  - Davivienda: `participantId=0051`, llave celular `@3166160533`, tipo `02`.
- Las llaves observadas se codifican con prefijo `@` dentro del subcampo `01`, incluso cuando la llave es un celular.
- Definir proveedor OCR/vision y presupuesto por transaccion.
- Configurar bucket privado y politica de retencion de comprobantes.
- Revisar terminos legales y privacidad para tratamiento de capturas bancarias.
