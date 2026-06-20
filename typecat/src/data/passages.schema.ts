import { z } from 'zod'

export const PassageSchema = z.object({
  id: z.string(),
  category: z.enum(['english', 'anime', 'programming']),
  subcategory: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  text: z.string(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type ValidatedPassage = z.infer<typeof PassageSchema>

export function validatePassages(data: unknown): ValidatedPassage[] {
  return z.array(PassageSchema).parse(data)
}