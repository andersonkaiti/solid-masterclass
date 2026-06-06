import { app } from './drivers/app.ts'
import { env } from './resources/config/env.ts'

try {
  await app.listen({ port: env.PORT }).then(() => {
    console.log(`🚀 Server running on port ${env.PORT}`)
  })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
