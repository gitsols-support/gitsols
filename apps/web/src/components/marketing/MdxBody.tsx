// Server-component MDX renderer used by /resources/blog/[slug] and
// /resources/case-studies/[slug].
//
// We map MDX elements to teal-palette Tailwind classes so the content reads
// like the rest of the site without dragging in a CSS prose plugin. Add
// remark/rehype plugins here (e.g. shiki for code highlight) as needs grow.

import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import remarkGfm from 'remark-gfm'

interface MdxBodyProps {
  source: string
}

export default function MdxBody({ source }: MdxBodyProps) {
  return (
    <div className="mdx-body">
      <MDXRemote
        source={source}
        components={mdxComponents}
        options={{
          parseFrontmatter: false,
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [],
          },
        }}
      />
    </div>
  )
}

const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="text-3xl font-bold text-[#0F4C4C] mt-12 mb-4 first:mt-0 scroll-mt-24"
      {...props}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-2xl font-bold text-[#0F4C4C] mt-10 mb-3 scroll-mt-24"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-lg font-semibold text-[#0F4C4C] mt-8 mb-2 scroll-mt-24"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-[15px] text-gray-700 leading-relaxed my-4" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="list-disc pl-6 space-y-2 my-4 text-[15px] text-gray-700 leading-relaxed marker:text-[#14B8A6]"
      {...props}
    />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="list-decimal pl-6 space-y-2 my-4 text-[15px] text-gray-700 leading-relaxed marker:text-[#14B8A6] marker:font-semibold"
      {...props}
    />
  ),
  a: ({ href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isInternal = href?.startsWith('/') === true
    if (isInternal && href) {
      return (
        <Link
          href={href}
          className="text-[#14B8A6] hover:text-[#0D9488] underline-offset-2 hover:underline"
          {...props}
        />
      )
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="text-[#14B8A6] hover:text-[#0D9488] underline-offset-2 hover:underline"
        {...props}
      />
    )
  },
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-[#14B8A6] bg-[#ECFEFE] pl-5 pr-4 py-3 my-6 text-[15px] text-[#0F4C4C] italic"
      {...props}
    />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    // Inline `code` — block code goes through <pre><code>.
    const isInline = !className
    if (isInline) {
      return (
        <code
          className="text-[13px] font-mono text-[#0F4C4C] bg-[#ECFEFE] px-1.5 py-0.5 rounded"
          {...props}
        />
      )
    }
    return <code className={`font-mono text-[13px] ${className ?? ''}`} {...props} />
  },
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="bg-[#0F4C4C] text-[#ECFEFE] rounded-xl p-4 my-6 overflow-x-auto text-[13px] leading-relaxed"
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-[#E2E8E8]" />,
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-[#E2E8E8]">
      <table className="w-full text-sm" {...props} />
    </div>
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="bg-[#F1F5F5] text-left text-[11px] font-bold uppercase tracking-[0.12em] text-[#14B8A6] px-4 py-3"
      {...props}
    />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-4 py-3 border-t border-[#E2E8E8] text-gray-700" {...props} />
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img className="my-6 rounded-xl border border-[#E2E8E8]" {...props} alt={props.alt ?? ''} />
  ),
}
