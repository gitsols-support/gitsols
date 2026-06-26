// File-system content loader for the marketing site's blog + case studies.
//
// Content lives at apps/web/src/content/{blog,case-studies}/*.mdx with Zod-
// validated frontmatter. We read everything at module load and cache it —
// content is part of the build, not a runtime fetch.
//
// Conventions:
//   - One MDX file per post / case study.
//   - Frontmatter is parsed with gray-matter (YAML).
//   - Slug = filename (without extension). No leading dates in filenames.
//   - Drafts (`draft: true`) are excluded in production builds.

import 'server-only'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { z } from 'zod'

const CONTENT_DIR = path.join(process.cwd(), 'src/content')

// ─── Frontmatter schemas ──────────────────────────────────────────────────

const baseFrontmatter = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(280),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use ISO date YYYY-MM-DD'),
  author: z.string().default('GITSOLS Engineering'),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
})

export const postFrontmatterSchema = baseFrontmatter
export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>

export const caseStudyFrontmatterSchema = baseFrontmatter.extend({
  client: z.string().min(1),
  industry: z.string().min(1),
  services: z.array(z.string()).default([]),
  outcomes: z.array(z.string()).default([]),
})
export type CaseStudyFrontmatter = z.infer<typeof caseStudyFrontmatterSchema>

// ─── Entry shape ──────────────────────────────────────────────────────────

export interface ContentEntry<TFront> {
  slug: string
  frontmatter: TFront
  body: string
  readingTimeMinutes: number
}

export type Post = ContentEntry<PostFrontmatter>
export type CaseStudy = ContentEntry<CaseStudyFrontmatter>

// ─── Loaders ──────────────────────────────────────────────────────────────

let postsCache: Post[] | null = null
let caseStudiesCache: CaseStudy[] | null = null

export function getPosts(): Post[] {
  if (postsCache) return postsCache
  postsCache = loadCollection('blog', postFrontmatterSchema)
  return postsCache
}

export function getPostBySlug(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug)
}

export function getCaseStudies(): CaseStudy[] {
  if (caseStudiesCache) return caseStudiesCache
  caseStudiesCache = loadCollection('case-studies', caseStudyFrontmatterSchema)
  return caseStudiesCache
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return getCaseStudies().find((c) => c.slug === slug)
}

// ─── Implementation ───────────────────────────────────────────────────────

function loadCollection<TSchema extends z.ZodTypeAny>(
  subdir: string,
  schema: TSchema,
): ContentEntry<z.infer<TSchema>>[] {
  const dir = path.join(CONTENT_DIR, subdir)
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))

  const entries: ContentEntry<z.infer<TSchema>>[] = []

  for (const file of files) {
    const fullPath = path.join(dir, file)
    const raw = fs.readFileSync(fullPath, 'utf8')
    const parsed = matter(raw)

    const result = schema.safeParse(parsed.data)
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  - ${i.path.join('.') || '<root>'}: ${i.message}`)
        .join('\n')
      throw new Error(
        `Invalid frontmatter in ${subdir}/${file}:\n${issues}\n` +
          `Fix the file or remove it from the build.`,
      )
    }

    const fm = result.data as z.infer<TSchema> & { draft?: boolean }
    // Hide drafts in production builds. Local dev / preview environments see
    // them so you can review before publishing.
    if (process.env.NODE_ENV === 'production' && fm.draft) continue

    const slug = file.replace(/\.(mdx|md)$/, '')
    entries.push({
      slug,
      frontmatter: result.data as z.infer<TSchema>,
      body: parsed.content,
      readingTimeMinutes: Math.max(1, Math.ceil(readingTime(parsed.content).minutes)),
    })
  }

  // Sort newest-first by publishedAt.
  entries.sort((a, b) => {
    const aDate = (a.frontmatter as { publishedAt: string }).publishedAt
    const bDate = (b.frontmatter as { publishedAt: string }).publishedAt
    return bDate.localeCompare(aDate)
  })

  return entries
}
