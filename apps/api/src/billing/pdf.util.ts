// Dependency-free PDF generator for invoices and proposals.
//
// We deliberately avoid pulling in a PDF library: the documents are simple,
// single-or-few-page, text-and-rule layouts. A hand-rolled writer using the
// 14 standard PDF fonts (Helvetica for prose, Courier for right-aligned money
// columns — monospace makes alignment exact without AFM width tables) keeps
// the API container small and has zero native dependencies on Railway.

interface Op {
  s: string
}

const PAGE_W = 612 // US Letter, points
const PAGE_H = 792
const MARGIN = 54

// Standard-14 font resource names.
const FONT = {
  body: 'F1', // Helvetica
  bold: 'F2', // Helvetica-Bold
  mono: 'F3', // Courier
  monoBold: 'F4', // Courier-Bold
} as const
type FontKey = keyof typeof FONT

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

/** Courier advance width is 600/1000 em — exact for right-alignment. */
function monoWidth(text: string, size: number): number {
  return text.length * size * 0.6
}

export class PdfDoc {
  private ops: Op[] = []
  private pages: string[] = []
  /** Cursor measured from the top of the page (we convert to PDF coords). */
  y = MARGIN

  private push(s: string) {
    this.ops.push({ s })
  }

  /** Top-anchored Y → PDF bottom-anchored Y. */
  private py(topY: number): number {
    return PAGE_H - topY
  }

  newPage() {
    if (this.ops.length) this.flushPage()
    this.y = MARGIN
  }

  private flushPage() {
    this.pages.push(this.ops.map((o) => o.s).join('\n'))
    this.ops = []
  }

  moveTo(topY: number) {
    this.y = topY
  }

  gap(dy: number) {
    this.y += dy
  }

  text(
    x: number,
    str: string,
    opts: { font?: FontKey; size?: number; color?: [number, number, number] } = {},
  ) {
    const font = FONT[opts.font ?? 'body']
    const size = opts.size ?? 10
    const [r, g, b] = opts.color ?? [0.06, 0.18, 0.18]
    this.push(`${r} ${g} ${b} rg`)
    this.push('BT')
    this.push(`/${font} ${size} Tf`)
    this.push(`1 0 0 1 ${x.toFixed(2)} ${this.py(this.y).toFixed(2)} Tm`)
    this.push(`(${esc(str)}) Tj`)
    this.push('ET')
  }

  /** Right-aligned text whose right edge sits at `xRight`. Use mono for money. */
  textRight(
    xRight: number,
    str: string,
    opts: { font?: FontKey; size?: number; color?: [number, number, number] } = {},
  ) {
    const size = opts.size ?? 10
    const font = opts.font ?? 'mono'
    const w = font === 'mono' || font === 'monoBold' ? monoWidth(str, size) : str.length * size * 0.5
    this.text(xRight - w, str, { ...opts, font })
  }

  line(x1: number, topY1: number, x2: number, topY2: number, opts: { width?: number; color?: [number, number, number] } = {}) {
    const [r, g, b] = opts.color ?? [0.83, 0.88, 0.87]
    this.push(`${r} ${g} ${b} RG`)
    this.push(`${(opts.width ?? 0.75).toFixed(2)} w`)
    this.push(`${x1.toFixed(2)} ${this.py(topY1).toFixed(2)} m ${x2.toFixed(2)} ${this.py(topY2).toFixed(2)} l S`)
  }

  rect(x: number, topY: number, w: number, h: number, fill: [number, number, number]) {
    const [r, g, b] = fill
    this.push(`${r} ${g} ${b} rg`)
    // PDF rect y is the bottom edge; topY is the top, so subtract height.
    this.push(`${x.toFixed(2)} ${this.py(topY + h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`)
  }

  /** Assemble the final PDF byte buffer. */
  build(): Buffer {
    this.flushPage()

    // Objects 1 and 2 are reserved for the Catalog and Pages tree, which we
    // emit first in `ordered` below. Everything created via addObj therefore
    // starts numbering at 3 — so the returned object number must include that
    // +2 offset for cross-references to resolve correctly.
    const objects: string[] = []
    const addObj = (body: string) => {
      objects.push(body)
      return objects.length + 2 // 1=Catalog, 2=Pages, then this object
    }

    // Reserve: 1=Catalog, 2=Pages, fonts, then page+content pairs.
    const fontObjs = {
      F1: addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'),
      F2: addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'),
      F3: addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>'),
      F4: addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>'),
    }

    const pageObjNums: number[] = []
    for (const content of this.pages) {
      const stream = `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`
      const contentNum = addObj(stream)
      const pageNum = addObj(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
          `/Resources << /Font << /F1 ${fontObjs.F1} 0 R /F2 ${fontObjs.F2} 0 R /F3 ${fontObjs.F3} 0 R /F4 ${fontObjs.F4} 0 R >> >> ` +
          `/Contents ${contentNum} 0 R >>`,
      )
      pageObjNums.push(pageNum)
    }

    const kids = pageObjNums.map((n) => `${n} 0 R`).join(' ')
    const pagesBody = `<< /Type /Pages /Count ${pageObjNums.length} /Kids [${kids}] >>`
    const catalogBody = '<< /Type /Catalog /Pages 2 0 R >>'

    // Now emit with fixed numbering: object 1 = catalog, 2 = pages, then the
    // rest in `objects` order starting at 3.
    const ordered: string[] = [catalogBody, pagesBody, ...objects]

    let pdf = '%PDF-1.4\n'
    const offsets: number[] = []
    for (let i = 0; i < ordered.length; i++) {
      offsets.push(Buffer.byteLength(pdf, 'latin1'))
      pdf += `${i + 1} 0 obj\n${ordered[i]}\nendobj\n`
    }
    const xrefStart = Buffer.byteLength(pdf, 'latin1')
    pdf += `xref\n0 ${ordered.length + 1}\n`
    pdf += '0000000000 65535 f \n'
    for (const off of offsets) {
      pdf += `${off.toString().padStart(10, '0')} 00000 n \n`
    }
    pdf += `trailer\n<< /Size ${ordered.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

    return Buffer.from(pdf, 'latin1')
  }
}

export const RIGHT_EDGE = PAGE_W - MARGIN
export const LEFT_EDGE = MARGIN
export const CONTENT_WIDTH = PAGE_W - MARGIN * 2
export { MARGIN, PAGE_W, PAGE_H }
