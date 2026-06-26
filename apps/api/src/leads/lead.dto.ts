// Zod-validated request body for POST /leads.
//
// We use Zod (rather than class-validator) here because the @gitsols/types
// CreateLeadRequest is the source of truth and Zod's schema → type inference
// keeps them in lock-step. The Nest pipe applies the schema at the
// controller boundary.

import { z } from 'zod'
import type { CreateLeadRequest } from '@gitsols/types'

export const createLeadSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    email: z.string().trim().email().max(320),
    phone: z.string().trim().min(7).max(40).optional(),
    company: z.string().trim().max(200).optional(),
    message: z.string().trim().max(5000).optional(),
    serviceInterest: z.string().trim().max(80).optional(),
    industry: z.string().trim().max(80).optional(),
    source: z
      .enum([
        'contact_form',
        'free_it_audit',
        'service_inquiry',
        'bespoke_scope_request',
        'phone',
        'referral',
        'other',
      ])
      .optional(),
    sourceUrl: z.string().trim().url().max(2000).optional(),
    attribution: z.record(z.string(), z.string()).optional(),
  })
  .strict()

// Compile-time sanity: the Zod output matches the shared type.
export type CreateLeadDto = z.infer<typeof createLeadSchema>
const _typecheck: CreateLeadRequest = {} as unknown as CreateLeadDto
void _typecheck
