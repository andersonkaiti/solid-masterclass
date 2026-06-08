import type { FastifyReply, FastifyRequest } from 'fastify'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import { EmailAlreadyExistsError } from '../application/errors/email-already-exists.ts'
import { PasswordsDoNotMatchError } from '../application/errors/passwords-do-not-match.ts'
import { UserCreationError } from '../application/errors/user-creation.ts'

export function errorHandler(
  error: Error,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      error: error.message,
    })
  }

  if (error instanceof PasswordsDoNotMatchError) {
    return reply.status(400).send({
      error: error.message,
    })
  }

  if (error instanceof EmailAlreadyExistsError) {
    return reply.status(409).send({
      error: error.message,
    })
  }

  if (error instanceof UserCreationError) {
    return reply.status(500).send({
      error: error.message,
    })
  }

  return reply.status(500).send({
    error: 'Internal server error',
  })
}
