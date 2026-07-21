import { NextResponse } from 'next/server'
import { AgentRouter } from '@/lib/ai/pipeline/agent-router'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { sessionKey, message, channel, storeId, traceId } = body

    if (!sessionKey || !message || !channel) {
      return NextResponse.json({ 
        error: 'Faltan parámetros requeridos: sessionKey, message, channel.' 
      }, { status: 400 })
    }

    const result = await AgentRouter.processMessage(
      sessionKey,
      message,
      channel,
      storeId || 'global',
      traceId
    )

    return NextResponse.json({
      success: true,
      response: result.response,
      traceId: result.traceId
    })
  } catch (error: any) {
    console.error('[API Agent Error]', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || String(error) 
    }, { status: 500 })
  }
}
