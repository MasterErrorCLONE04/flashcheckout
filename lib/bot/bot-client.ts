import { prisma } from '@/lib/prisma'
import { waClient as officialWaClient } from '@/lib/whatsapp/cloud-api'
import { BotClient, SessionRecord, StoreRecord, toChatMessages } from './bot-types'

export async function createLoggedBotClient(
  session: SessionRecord,
  store: StoreRecord | null
): Promise<BotClient> {
  const isGlobal = !session.storeId || session.storeId === 'global'
  let client: BotClient = officialWaClient

  if (!isGlobal && store && store.whatsappInstanceName && store.whatsappConnected) {
    const activeStore = store
    const { evolutionClient } = await import('@/lib/whatsapp/evolution')
    client = {
      sendText: (to: string, msg: string) => evolutionClient.sendText(activeStore.whatsappInstanceName!, to, msg),
      sendButtons: (to: string, msg: string, btns: { id: string; title: string }[]) =>
        evolutionClient.sendButtons(activeStore.whatsappInstanceName!, to, msg, btns),
      sendList: (
        to: string,
        hdr: string,
        bdy: string,
        btnText: string,
        secs: { title: string; rows: { id: string; title: string; description?: string }[] }[]
      ) => evolutionClient.sendList(activeStore.whatsappInstanceName!, to, hdr, bdy, btnText, secs),
      sendImage: (to: string, img: string, cap: string) =>
        evolutionClient.sendImage(activeStore.whatsappInstanceName!, to, img, cap),
      sendDocument: (to: string, doc: string, fn: string) =>
        evolutionClient.sendDocument(activeStore.whatsappInstanceName!, to, doc, fn),
      sendUrlButton: (to: string, bdy: string, btnText: string, url: string) =>
        evolutionClient.sendUrlButton(activeStore.whatsappInstanceName!, to, bdy, btnText, url),
      sendLocationRequest: (to: string, msg: string) =>
        evolutionClient.sendLocationRequest(activeStore.whatsappInstanceName!, to, msg)
    }
  }

  const logBotOutgoing = async (outText: string) => {
    try {
      const currentSession = await prisma.whatsAppSession.findUnique({
        where: { id: session.id }
      })
      if (!currentSession) return
      const messages = toChatMessages(currentSession.messages)

      const lastMsg = messages[messages.length - 1]
      if (lastMsg && lastMsg.sender === 'bot' && lastMsg.text === outText) {
        return
      }

      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      messages.push({
        sender: 'bot',
        text: outText,
        time: timeString,
        timestamp: Date.now()
      })

      await prisma.whatsAppSession.update({
        where: { id: currentSession.id },
        data: { messages: messages as unknown as object }
      })
    } catch (err) {
      console.error('[logBotOutgoing Error]', err)
    }
  }

  return {
    sendText: async (to: string, msg: string) => {
      try {
        const res = await client.sendText(to, msg)
        await logBotOutgoing(msg)
        return res
      } catch (err) {
        console.warn('[WhatsApp Bot] sendText warning:', err)
      }
    },
    sendButtons: async (to: string, msg: string, btns: { id: string; title: string }[]) => {
      try {
        const res = await client.sendButtons(to, msg, btns)
        await logBotOutgoing(msg)
        return res
      } catch (err) {
        console.warn('[WhatsApp Bot] sendButtons warning:', err)
      }
    },
    sendList: async (to: string, hdr: string, bdy: string, btnText: string, secs: { title: string; rows: { id: string; title: string; description?: string }[] }[]) => {
      try {
        const res = await client.sendList(to, hdr, bdy, btnText, secs)
        await logBotOutgoing(`${hdr}\n${bdy}`)
        return res
      } catch (err) {
        console.warn('[WhatsApp Bot] sendList warning:', err)
      }
    },
    sendImage: async (to: string, img: string, cap: string) => {
      try {
        const res = await client.sendImage(to, img, cap)
        await logBotOutgoing(cap ? `[Imagen] ${cap}` : '[Imagen]')
        return res
      } catch (err) {
        console.warn('[WhatsApp Bot] sendImage warning:', err)
      }
    },
    sendDocument: async (to: string, doc: string, fn: string) => {
      try {
        const res = await client.sendDocument(to, doc, fn)
        await logBotOutgoing(`[Documento] ${fn}`)
        return res
      } catch (err) {
        console.warn('[WhatsApp Bot] sendDocument warning:', err)
      }
    },
    sendUrlButton: async (to: string, bdy: string, btnText: string, url: string) => {
      try {
        const res = await client.sendUrlButton(to, bdy, btnText, url)
        await logBotOutgoing(bdy)
        return res
      } catch (err) {
        console.warn('[WhatsApp Bot] sendUrlButton warning:', err)
      }
    },
    sendFlow: async (to: string, flowId: string, buttonText: string, flowToken: string, screen: string, data: Record<string, unknown>, header?: string, body?: string) => {
      if (typeof client.sendFlow === 'function') {
        try {
          const res = await client.sendFlow(to, flowId, buttonText, flowToken, screen, data, header, body)
          await logBotOutgoing(body || `[Flujo: ${buttonText}]`)
          return res
        } catch (err) {
          console.warn('[WhatsApp Bot] sendFlow warning:', err)
          throw err
        }
      }
      throw new Error('sendFlow is not supported on this client configuration.')
    },
    sendLocationRequest: async (to: string, msg: string) => {
      try {
        if (typeof client.sendLocationRequest === 'function') {
          const res = await client.sendLocationRequest(to, msg)
          await logBotOutgoing(msg)
          return res
        } else {
          const res = await client.sendText(to, msg)
          await logBotOutgoing(msg)
          return res
        }
      } catch (err) {
        console.warn('[WhatsApp Bot] sendLocationRequest warning:', err)
      }
    }
  }
}
