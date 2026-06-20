export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
}

export type InteractiveLink = {
  id: string;
  title: string;
  description?: string;
};

export class WhatsAppCloudAPI {
  private url: string;
  private accessToken: string;

  constructor(config: WhatsAppConfig) {
    this.url = `https://graph.facebook.com/v21.0/${config.phoneNumberId}/messages`;
    this.accessToken = config.accessToken;
  }

  async sendText(to: string, text: string) {
    return this.send({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: text },
    });
  }

  async sendButtons(to: string, text: string, buttons: { id: string; title: string }[]) {
    return this.send({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text },
        action: {
          buttons: buttons.map(b => ({
            type: 'reply',
            reply: { id: b.id, title: b.title },
          })),
        },
      },
    });
  }

  async sendList(to: string, header: string, body: string, buttonText: string, sections: { title: string; rows: InteractiveLink[] }[]) {
    return this.send({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: { type: 'text', text: header },
        body: { text: body },
        action: {
          button: buttonText,
          sections: sections.map(s => ({
            title: s.title,
            rows: s.rows.map(r => ({
              id: r.id,
              title: r.title,
              description: r.description,
            })),
          })),
        },
      },
    });
  }

  async sendImageButtons(to: string, imageUrl: string, body: string, buttons: { id: string; title: string }[]) {
    return this.send({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        header: {
          type: 'image',
          image: { link: imageUrl }
        },
        body: { text: body },
        action: {
          buttons: buttons.map(b => ({
            type: 'reply',
            reply: { id: b.id, title: b.title },
          })),
        },
      },
    });
  }

  async sendImage(to: string, imageUrl: string, caption: string) {
    return this.send({
      messaging_product: 'whatsapp',
      to,
      type: 'image',
      image: {
        link: imageUrl,
        caption: caption
      }
    });
  }

  async sendDocument(to: string, documentUrl: string, filename: string) {
    return this.send({
      messaging_product: 'whatsapp',
      to,
      type: 'document',
      document: {
        link: documentUrl,
        filename: filename
      }
    });
  }

  async sendUrlButton(to: string, body: string, buttonText: string, url: string) {

    return this.send({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'cta_url',
        body: { text: body },
        action: {
          name: 'cta_url',
          parameters: {
            display_text: buttonText,
            url: url
          }
        }
      }
    });
  }

  async sendFlow(to: string, flowId: string, flowCta: string, flowToken: string, screen: string, data: any, header?: string, body?: string, footer?: string) {
    return this.send({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'flow',
        header: header ? { type: 'text', text: header } : undefined,
        body: { text: body || 'Selecciona tus productos:' },
        footer: footer ? { text: footer } : undefined,
        action: {
          name: 'flow',
          parameters: {
            flow_message_version: '3',
            flow_token: flowToken,
            flow_id: flowId,
            flow_cta: flowCta,
            flow_action: 'navigate',
            flow_action_payload: {
              screen: screen,
              data: data
            }
          }
        }
      }
    });
  }

  private async send(payload: any) {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[WhatsApp API Error]', error);
      throw new Error(error.error?.message || 'Failed to send WhatsApp message');
    }

    return response.json();
  }

  async downloadMedia(mediaId: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const url = `https://graph.facebook.com/v21.0/${mediaId}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[WhatsApp Media Info Error]', err);
      throw new Error('Failed to retrieve media info from WhatsApp');
    }

    const mediaInfo = await response.json();
    const downloadUrl = mediaInfo.url;
    const mimeType = mediaInfo.mime_type;

    const downloadResponse = await fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!downloadResponse.ok) {
      throw new Error('Failed to download media file from WhatsApp');
    }

    const arrayBuffer = await downloadResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return { buffer, mimeType };
  }
}

// Singleton helper for the app
export const waClient = new WhatsAppCloudAPI({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
});

export async function notifyOrderConfirmed(orderId: string, phone: string) {
  const message = `Tu pago ha sido validado correctamente. Tu pedido *#${orderId.slice(-6).toUpperCase()}* ha sido procesado. ✅`;
  await waClient.sendText(phone, message);
  
  try {
    const { sendInvoiceToWhatsApp } = await import('./send-invoice');
    await sendInvoiceToWhatsApp(orderId);
  } catch (err) {
    console.error('[notifyOrderConfirmed] Error sending invoice:', err);
  }
}

export async function notifyOrderRejected(orderId: string, phone: string, reason: string) {
  const message = `Lo sentimos, tu pago para el pedido *#${orderId.slice(-6).toUpperCase()}* no pudo ser validado. ❌\n\n*Motivo:* ${reason}\n\nPor favor, realiza el pago correspondiente e intenta subir el comprobante de nuevo.`;
  await waClient.sendText(phone, message);
}

