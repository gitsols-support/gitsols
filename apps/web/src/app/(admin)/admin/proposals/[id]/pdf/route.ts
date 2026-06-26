import { apiFetchRaw } from '@/server/api-client'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { body, contentType, disposition } = await apiFetchRaw(`/proposals/${id}/pdf`)
    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition ?? `attachment; filename="proposal-${id}.pdf"`,
      },
    })
  } catch {
    return new Response('Unable to generate PDF', { status: 502 })
  }
}
