import type { SessionContext } from './session-manager'

export type { SessionContext }

export interface MCPTool {
  name: string
  description: string
  inputSchema: Record<string, any>
  execute: (args: any, context: { storeId: string; traceId: string; session: any; sessionKey: string; channel: 'WHATSAPP' | 'WEB' }) => Promise<any>
}

export class ToolRegistry {
  private static tools: Map<string, MCPTool> = new Map()

  public static register(tool: MCPTool): void {
    this.tools.set(tool.name, tool)
    console.log(`[ToolRegistry] Herramienta registrada: ${tool.name}`)
  }

  public static get(name: string): MCPTool | undefined {
    return this.tools.get(name)
  }

  public static getAll(): MCPTool[] {
    return Array.from(this.tools.values())
  }
}
