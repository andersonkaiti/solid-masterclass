import { randomUUID } from 'node:crypto'
import { hash } from 'bcrypt'
import type { UserRepository } from '../../resources/repositories/user-repository.ts'
import { EmailAlreadyExistsError } from '../errors/email-already-exists.ts'
import { PasswordsDoNotMatchError } from '../errors/passwords-do-not-match.ts'
import { UserCreationError } from '../errors/user-creation.ts'
import { SendNotificationFactory } from '../factories/index.ts'

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
  constructor(private userRepository: UserRepository) {}

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

    const existingUser = await this.userRepository.findByEmail(email)

    if (existingUser) {
      throw new EmailAlreadyExistsError()
    }

    const hashedPassword = await hash(password, 10)

    const user = await this.userRepository.create({
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

    const sendNotification = SendNotificationFactory.create(
      input.preferredMarketingChannel,
    )

    await sendNotification.send()

    const { password: _, ...data } = user

    return data
  }
}
