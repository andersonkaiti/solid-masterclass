import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { CreateUser } from '../../application/use-cases/create-user.ts'
import { UserRepositoryDrizzle } from '../../resources/repositories/user-repository.ts'

export async function createUserRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/users',
    schema: {
      body: z.object({
        name: z.string().trim().min(1),
        age: z.number().int().min(18).max(100),
        phoneNumber: z.string().trim().min(1),
        email: z.email().trim(),
        password: z.string().min(8),
        passwordConfirmation: z.string().min(8),
        preferredMarketingChannel: z.enum(['email', 'sms', 'push', 'whatsapp']),
      }),
      response: {
        201: z.object({
          name: z.string().trim().min(1),
          age: z.number().int().min(18).max(100),
          phoneNumber: z.string().trim().min(1),
          email: z.email().trim(),
          preferredMarketingChannel: z.enum([
            'email',
            'sms',
            'push',
            'whatsapp',
          ]),
        }),
        400: z.object({
          error: z.string(),
        }),
        409: z.object({
          error: z.string(),
        }),
        500: z.object({
          error: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const createUser = new CreateUser(new UserRepositoryDrizzle())

      const output = await createUser.execute(request.body)

      return reply.status(201).send(output)
    },
  })
}
