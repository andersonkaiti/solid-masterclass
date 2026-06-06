import { randomUUID } from 'node:crypto'
import { hash } from 'bcrypt'
import { UserDAO } from '../../resources/daos/user-dao.ts'
import { EmailAlreadyExistsError } from '../errors/email-already-exists.ts'
import { PasswordsDoNotMatchError } from '../errors/passwords-do-not-match.ts'
import { UserCreationError } from '../errors/user-creation.ts'

interface InputDTO {
  name: string
  age: number
  phoneNumber: string
  email: string
  password: string
  passwordConfirmation: string
  preferredMarketingChannel: 'email' | 'sms' | 'push' | 'whatsapp'
}

interface OutputDTO {
  name: string
  age: number
  phoneNumber: string
  email: string
  preferredMarketingChannel: 'email' | 'sms' | 'push' | 'whatsapp'
}

export class CreateUser {
  async execute(input: InputDTO): Promise<OutputDTO> {
    const {
      age,
      email,
      name,
      password,
      passwordConfirmation,
      phoneNumber,
      preferredMarketingChannel,
    } = input

    if (password !== passwordConfirmation) {
      throw new PasswordsDoNotMatchError()
    }

    const userDAO = new UserDAO()

    const existingUser = await userDAO.findByEmail(email)

    if (existingUser) {
      throw new EmailAlreadyExistsError()
    }

    const hashedPassword = await hash(password, 10)

    const user = await userDAO.create({
      id: randomUUID(),
      age,
      email,
      name,
      phoneNumber,
      preferredMarketingChannel,
      password: hashedPassword,
    })

    if (!user) {
      throw new UserCreationError()
    }

    const { password: _, ...data } = user

    return data
  }
}
