import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { hash } from 'bcrypt'
import { eq } from 'drizzle-orm'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from './db/client.ts'
import { usersTable } from './db/schema.ts'

export const app = fastify({ logger: true })

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'SOLID Masterclass',
      version: '1.0.0',
    },
    servers: [],
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

app.get('/', () => ({ message: 'SOLID ' }))

app.after(() => {
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
          id: z.uuid(),
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
      try {
        const {
          age,
          email,
          name,
          password,
          passwordConfirmation,
          phoneNumber,
          preferredMarketingChannel,
        } = request.body

        if (password !== passwordConfirmation) {
          return reply.status(400).send({
            error: 'As senhas não coincidem',
          })
        }

        const [existingUser] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))

        if (existingUser) {
          return reply.status(409).send({
            error: 'Usuário já cadastrado',
          })
        }

        const [user] = await db
          .insert(usersTable)
          .values({
            age,
            email,
            name,
            password: await hash(password, 10),
            phoneNumber,
            preferredMarketingChannel,
          })
          .returning()

        if (!user) {
          return reply.status(500).send({
            error: 'Erro ao criar usuário',
          })
        }

        return reply.status(201).send({
          id: user.id,
        })
      } catch (error) {
        console.error(error)
        return reply.status(500).send({
          error: 'Erro ao criar usuário',
        })
      }
    },
  })
})
