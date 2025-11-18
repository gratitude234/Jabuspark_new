import type { Buffer } from 'node:buffer'
import pdf from 'pdf-parse'

export async function extractPdfPages(buffer: Buffer) {
  const pages: string[] = []
  const options = {
    pagerender: (pageData: any) =>
      pageData.getTextContent({ normalizeWhitespace: true }).then((textContent: any) => {
        const text = textContent.items.map((item: any) => item.str).join(' ')
        pages.push(text)
        return text
      }),
  }
  await pdf(buffer, options)
  return pages.map((content, idx) => ({ page: idx + 1, content: content.trim() }))
}
