import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import z from 'zod'
import { EmailAlreadyExistsError } from '../application/errors/email-already-exists.ts'
import { PasswordsDoNotMatchError } from '../application/errors/passwords-do-not-match.ts'
import { UserCreationError } from '../application/errors/user-creation.ts'
import { CreateUser } from '../application/use-cases/create-user.ts'

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
      try {
        const createUser = new CreateUser()

        const output = await createUser.execute(request.body)

        return reply.status(201).send(output)
      } catch (error) {
        if (error instanceof PasswordsDoNotMatchError) {
          return reply.status(400).send({ error: error.message })
        }

        if (error instanceof EmailAlreadyExistsError) {
          return reply.status(409).send({ error: error.message })
        }

        if (error instanceof UserCreationError) {
          return reply.status(500).send({ error: error.message })
        }

        return reply.status(500).send({ error: 'Error creating user' })
      }
    },
  })
})
