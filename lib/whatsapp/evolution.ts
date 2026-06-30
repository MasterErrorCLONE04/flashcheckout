export interface EvolutionConfig {
  apiUrl: string;
  apiKey: string;
}

export class EvolutionClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(config?: Partial<EvolutionConfig>) {
    this.apiUrl = config?.apiUrl || process.env.EVOLUTION_API_URL || '';
    this.apiKey = config?.apiKey || process.env.EVOLUTION_API_KEY || '';
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'apikey': this.apiKey,
    };
  }

  private cleanNumber(phone: string): string {
    // Remove symbols and ensure it has correct format for Evolution API (digits only)
    return phone.replace(/\D/g, '');
  }

  // --- Instance Management ---

  async createInstance(instanceName: string) {
    const url = `${this.apiUrl}/instance/create`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
        reject_call: false,
        groups_ignore: true,
        always_online: true,
        read_messages: true,
        read_status: false,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[Evolution API Create Error]', err);
      throw new Error(err.message || 'Failed to create WhatsApp instance');
    }

    const data = await response.json();
    return data;
  }

  async setWebhook(instanceName: string) {
    const url = `${this.apiUrl}/webhook/set/${instanceName}`;
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/webhook`;
    
    console.log(`[Evolution Client] Setting webhook URL for ${instanceName} to: ${webhookUrl}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        webhook: {
          enabled: true,
          url: webhookUrl,
          headers: {
            'apikey': this.apiKey
          },
          byEvents: false,
          events: ['MESSAGES_UPSERT']
        }
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[Evolution API Webhook Error]', err);
      throw new Error(err.message || 'Failed to set webhook for instance');
    }

    return response.json();
  }

  async getQR(instanceName: string): Promise<{ code?: string; base64?: string; status: string }> {
    const url = `${this.apiUrl}/instance/connect/${instanceName}`;
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      // If instance is already connected or not found
      const err = await response.json().catch(() => ({}));
      if (err.instance?.state === 'open' || err.status === 409) {
        return { status: 'CONNECTED' };
      }
      console.error('[Evolution API QR Error]', err);
      throw new Error(err.message || 'Failed to retrieve connection QR');
    }

    const data = await response.json();
    if (data.instance?.state === 'open' || data.state === 'open') {
      return { status: 'CONNECTED' };
    }
    return {
      code: data.code || data.qrcode?.code,
      base64: data.base64 || data.qrcode?.base64,
      status: 'QRCODE'
    };
  }

  async deleteInstance(instanceName: string) {
    const url = `${this.apiUrl}/instance/delete/${instanceName}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok && response.status !== 404) {
      const err = await response.json().catch(() => ({}));
      console.error('[Evolution API Delete Error]', err);
      throw new Error(err.message || 'Failed to delete instance');
    }

    return { success: true };
  }

  async checkStatus(instanceName: string): Promise<'CONNECTED' | 'DISCONNECTED'> {
    const url = `${this.apiUrl}/instance/connectionState/${instanceName}`;
    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });
      if (!response.ok) return 'DISCONNECTED';
      const data = await response.json();
      return data.instance?.state === 'open' ? 'CONNECTED' : 'DISCONNECTED';
    } catch {
      return 'DISCONNECTED';
    }
  }

  // --- Message Sending Methods ---

  async sendText(instanceName: string, to: string, text: string) {
    const url = `${this.apiUrl}/message/sendText/${instanceName}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        number: this.cleanNumber(to),
        text: text,
        options: {
          delay: 2000,
          presence: 'composing'
        }
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[Evolution API SendText Error]', err);
      throw new Error(err.message || 'Failed to send text via Evolution API');
    }

    return response.json();
  }

  async sendButtons(instanceName: string, to: string, text: string, buttons: { id: string; title: string }[]) {
    // Standard Baileys buttons can sometimes fail on newer WhatsApp versions, 
    // so we can also fallback to formatting them as a text menu if sendButtons fails,
    // but Evolution API supports standard message sending. Let's send the official payload first.
    const url = `${this.apiUrl}/message/sendButtons/${instanceName}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        number: this.cleanNumber(to),
        options: {
          delay: 1500,
          presence: 'composing'
        },
        buttonPayload: {
          displayText: text,
          buttons: buttons.map(b => ({
            type: 'reply',
            reply: {
              id: b.id,
              title: b.title
            }
          }))
        }
      }),
    });

    if (!response.ok) {
      // Fallback: If buttons are not supported or fail, send as formatted text list
      const fallbackText = `${text}\n\n` + buttons.map((b, i) => `*${i + 1}*. ${b.title}`).join('\n') + `\n\n_(Responde escribiendo una opción)_`;
      return this.sendText(instanceName, to, fallbackText);
    }

    return response.json();
  }

  async sendList(instanceName: string, to: string, header: string, body: string, buttonText: string, sections: { title: string; rows: { id: string; title: string; description?: string }[] }[]) {
    const url = `${this.apiUrl}/message/sendList/${instanceName}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        number: this.cleanNumber(to),
        options: {
          delay: 1500,
          presence: 'composing'
        },
        listPayload: {
          title: header,
          description: body,
          buttonText: buttonText,
          sections: sections.map(s => ({
            title: s.title,
            rows: s.rows.map(r => ({
              rowId: r.id,
              title: r.title,
              description: r.description || ''
            }))
          }))
        }
      }),
    });

    if (!response.ok) {
      // Fallback: Send lists as formatted text
      let fallbackText = `*${header}*\n${body}\n\n`;
      let optionCount = 1;
      sections.forEach(s => {
        fallbackText += `*${s.title}*:\n`;
        s.rows.forEach(r => {
          fallbackText += `*${optionCount}*. ${r.title} ${r.description ? `- _${r.description}_` : ''}\n`;
          optionCount++;
        });
        fallbackText += '\n';
      });
      fallbackText += `_(Responde escribiendo una opción o número)_`;
      return this.sendText(instanceName, to, fallbackText);
    }

    return response.json();
  }

  async sendImage(instanceName: string, to: string, imageUrl: string, caption: string) {
    const url = `${this.apiUrl}/message/sendMedia/${instanceName}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        number: this.cleanNumber(to),
        options: {
          delay: 1500,
          presence: 'composing'
        },
        mediatype: 'image',
        fileName: 'imagen.jpg',
        media: imageUrl,
        caption: caption
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[Evolution API SendImage Error]', err);
      throw new Error(err.message || 'Failed to send image via Evolution API');
    }

    return response.json();
  }

  async sendDocument(instanceName: string, to: string, documentUrl: string, filename: string) {
    const url = `${this.apiUrl}/message/sendMedia/${instanceName}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        number: this.cleanNumber(to),
        options: {
          delay: 1500,
          presence: 'composing'
        },
        mediatype: 'document',
        fileName: filename,
        media: documentUrl,
        caption: filename
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[Evolution API SendDocument Error]', err);
      throw new Error(err.message || 'Failed to send document via Evolution API');
    }

    return response.json();
  }

  async downloadMedia(instanceName: string, messageKey: any, message: any): Promise<Buffer> {
    const url = `${this.apiUrl}/message/downloadMedia/${instanceName}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        message: {
          key: messageKey,
          message: message
        }
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[Evolution API downloadMedia Error]', err);
      throw new Error(err.message || 'Failed to download media via Evolution API');
    }

    const data = await response.json();
    // Evolution API returns { base64: "data:image/png;base64,..." }
    const base64Str = data.base64.replace(/^data:image\/\w+;base64,/, "");
    return Buffer.from(base64Str, 'base64');
  }

  async sendUrlButton(instanceName: string, to: string, body: string, buttonText: string, url: string) {
    // WhatsApp Web / Baileys does not support URL buttons natively,
    // so we format it beautifully as text.
    const message = `${body}\n\n🔗 *${buttonText}:* ${url}`;
    return this.sendText(instanceName, to, message);
  }
}

export const evolutionClient = new EvolutionClient();
