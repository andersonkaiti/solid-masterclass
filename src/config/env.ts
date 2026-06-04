import { z } from 'zod'

const envSchema = z.object({
  PORT: z.number().default(3000),
  DATABASE_URL: z.url(),
})

export const env = envSchema.parse(process.env)
