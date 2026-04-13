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
}

// Singleton helper for the app
export const waClient = new WhatsAppCloudAPI({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
});
