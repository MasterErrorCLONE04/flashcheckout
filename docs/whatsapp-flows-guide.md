# Guía de Implementación: WhatsApp Flows vs Web Checkout en FlashCheckout

FlashCheckout soporta dos modalidades de venta en WhatsApp para adaptarse tanto a pequeños comerciantes como a marcas escalando con pauta en Meta Ads:

---

## 1. Modos de Venta Disponibles

### Modo 1: Agente Conversador + Checkout Web (Recomendado para el 90% de usuarios)
* **Cómo funciona:**
  1. El cliente escribe al WhatsApp de la tienda.
  2. El asistente de IA responde preguntas sobre catálogo, stock, ubicación y métodos de pago.
  3. Cuando el cliente quiere ordenar, el bot envía un mensaje interactivo con el botón **"🛍️ Abrir Catálogo Web"**.
  4. El enlace redirige a `https://flashcheckouts.com/tienda/[slug]`.
  5. El cliente arma su carrito con fotos en alta resolución, selecciona variantes y completa el pago/pedido en la web.
* **Ventajas:**
  * Cero configuración técnica de Meta Business.
  * Costo de API de Meta: **$0 COP**.
  * Compatible con números personales y WhatsApp Business App estándar.

---

### Modo 2: WhatsApp Flows Nativo (100% In-Chat)
* **Cómo funciona:**
  1. El cliente inicia chat (orgánico o desde anuncio *Click-to-WhatsApp* de Instagram/Facebook).
  2. El bot despliega el Flow interactivo nativo de WhatsApp.
  3. Se abre una ventana modal dentro de la misma app de WhatsApp.
  4. El cliente selecciona productos, cantidades, ingresa su nombre y dirección de entrega.
  5. Al tocar **"Confirmar Pedido"**, el Flow envía los datos al webhook de FlashCheckout y genera la orden automáticamente en la base de datos.
* **Ventajas:**
  * Cierre en menos de 30 segundos.
  * Tasa de conversión 20% a 35% más alta al evitar la salida al navegador.

---

## 2. Plantilla de WhatsApp Flow JSON (Para Meta Flow Builder)

Para registrar el Flow en **Meta Business Suite > WhatsApp Manager > Flows**:

```json
{
  "version": "6.0",
  "screens": [
    {
      "id": "CATALOG",
      "title": "Catálogo Oficial",
      "terminal": true,
      "data": {
        "products": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "string" },
              "title": { "type": "string" },
              "description": { "type": "string" }
            }
          },
          "__example__": [
            {
              "id": "prod_1",
              "title": "Camiseta Oversize",
              "description": "$75.000 COP • Algodón 100%"
            }
          ]
        }
      },
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "TextHeading",
            "text": "Arma tu pedido"
          },
          {
            "type": "TextSubheading",
            "text": "Selecciona los productos y llena tus datos de entrega:"
          },
          {
            "type": "Form",
            "name": "order_form",
            "children": [
              {
                "type": "CheckboxGroup",
                "name": "selections",
                "label": "Elige tus productos:",
                "required": true,
                "data-source": "${data.products}"
              },
              {
                "type": "TextInput",
                "name": "full_name",
                "label": "Tu nombre completo:",
                "required": true,
                "input-type": "text"
              },
              {
                "type": "TextInput",
                "name": "address",
                "label": "Dirección de entrega (Calle, Cra, Apto):",
                "required": true,
                "input-type": "text"
              },
              {
                "type": "TextInput",
                "name": "city",
                "label": "Ciudad / Municipio:",
                "required": true,
                "input-type": "text"
              },
              {
                "type": "Footer",
                "label": "Confirmar y Enviar Pedido 🛍️",
                "on-click-action": {
                  "name": "complete",
                  "payload": {
                    "selections": "${form.selections}",
                    "full_name": "${form.full_name}",
                    "address": "${form.address}",
                    "city": "${form.city}"
                  }
                }
              }
            ]
          }
        ]
      }
    }
  ]
}
```

---

## 3. Endpoints Integrados en FlashCheckout

* **Data Exchange Endpoint (Life-Cycle & Pre-fill):**
  * `POST /api/whatsapp/flows`
  * Acciones soportadas: `ping`, `INIT` (carga catálogo dinámico de la tienda), `data_exchange`.
* **Webhook de Recepción de Pedidos:**
  * `POST /api/whatsapp/webhook`
  * Decodifica mensajes interactivos de tipo `nfm_reply` y dispara la creación de orden en la base de datos Prisma.
