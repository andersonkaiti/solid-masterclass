import Fastify from 'fastify'
import { env } from './config/env.ts'

const fastify = Fastify({ logger: true })

fastify.get('/', () => ({ message: 'SOLID Masterclass' }))

try {
  await fastify.listen({ port: env.PORT }).then(() => {
    console.log(`🚀 Server running on port ${env.PORT}`)
  })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
