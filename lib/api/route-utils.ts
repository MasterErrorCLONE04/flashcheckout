import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function apiJsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export function badRequest(message: string) {
  return apiJsonError(message, 400)
}

export function unauthorized(message = 'Unauthorized') {
  return apiJsonError(message, 401)
}

export function forbidden(message = 'Forbidden') {
  return apiJsonError(message, 403)
}

export function notFound(message = 'Not found') {
  return apiJsonError(message, 404)
}

export function internalServerError(message = 'Internal Server Error') {
  return apiJsonError(message, 500)
}

export function getErrorMessage(error: unknown, fallback = 'Internal Server Error') {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export async function parseJsonBody<T extends Record<string, unknown> = Record<string, unknown>>(
  req: Request
): Promise<T | null> {
  try {
    const body = await req.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return null
    }

    return body as T
  } catch {
    return null
  }
}
