import { apiFetchRaw } from '@/server/api-client'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { body, contentType, disposition } = await apiFetchRaw(`/invoices/${id}/pdf`)
    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition ?? `attachment; filename="invoice-${id}.pdf"`,
      },
    })
  } catch {
    return new Response('Unable to generate PDF', { status: 502 })
  }
}
