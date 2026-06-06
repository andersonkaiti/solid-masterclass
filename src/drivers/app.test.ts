import { faker } from '@faker-js/faker'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { db } from '../resources/db/client.ts'
import { usersTable } from '../resources/db/schema.ts'
import { app } from './app.ts'

beforeAll(async () => {
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

beforeEach(async () => {
  await db.delete(usersTable)
})

function makeUser(overrides?: Partial<Record<string, unknown>>) {
  const password = faker.internet.password({ length: 10 })

  return {
    name: faker.person.fullName(),
    age: faker.number.int({ min: 18, max: 100 }),
    email: faker.internet.email(),
    password,
    passwordConfirmation: password,
    phoneNumber: faker.phone.number(),
    preferredMarketingChannel: faker.helpers.arrayElement([
      'email',
      'sms',
      'push',
      'whatsapp',
    ]),
    ...overrides,
  }
}

describe('GET /', () => {
  it('should return 200 with a message', async () => {
    const response = await request(app.server).get('/')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('message')
  })
})

describe('POST /users', () => {
  it('should return 201 and the user data when the user is created', async () => {
    const user = makeUser()
    const response = await request(app.server).post('/users').send(user)

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      name: user.name,
      age: user.age,
      email: user.email,
      phoneNumber: user.phoneNumber,
      preferredMarketingChannel: user.preferredMarketingChannel,
    })
  })

  it('should return 400 if passwords do not match', async () => {
    const response = await request(app.server)
      .post('/users')
      .send(
        makeUser({
          password: 'password123',
          passwordConfirmation: 'different123',
        }),
      )

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 409 if the email is already registered', async () => {
    const user = makeUser()
    await request(app.server).post('/users').send(user)

    const response = await request(app.server).post('/users').send(user)

    expect(response.status).toBe(409)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 400 if age is under 18', async () => {
    const response = await request(app.server)
      .post('/users')
      .send(makeUser({ age: 17 }))

    expect(response.status).toBe(400)
  })

  it('should return 400 if email is invalid', async () => {
    const response = await request(app.server)
      .post('/users')
      .send(makeUser({ email: 'not-an-email' }))

    expect(response.status).toBe(400)
  })

  it('should return 400 if age exceeds 100', async () => {
    const response = await request(app.server)
      .post('/users')
      .send(makeUser({ age: 101 }))

    expect(response.status).toBe(400)
  })

  it('should return 400 if age is not an integer', async () => {
    const response = await request(app.server)
      .post('/users')
      .send(makeUser({ age: 18.5 }))

    expect(response.status).toBe(400)
  })

  it('should return 400 if password is too short', async () => {
    const response = await request(app.server)
      .post('/users')
      .send(makeUser({ password: 'short', passwordConfirmation: 'short' }))

    expect(response.status).toBe(400)
  })

  it('should return 400 if name is empty', async () => {
    const response = await request(app.server)
      .post('/users')
      .send(makeUser({ name: '' }))

    expect(response.status).toBe(400)
  })

  it('should return 400 if phone number is empty', async () => {
    const response = await request(app.server)
      .post('/users')
      .send(makeUser({ phoneNumber: '' }))

    expect(response.status).toBe(400)
  })

  it('should return 400 if preferredMarketingChannel is invalid', async () => {
    const response = await request(app.server)
      .post('/users')
      .send(makeUser({ preferredMarketingChannel: 'telegram' }))

    expect(response.status).toBe(400)
  })

  it('should return 400 if a required field is missing', async () => {
    const { name: _, ...userWithoutName } = makeUser()

    const response = await request(app.server)
      .post('/users')
      .send(userWithoutName)

    expect(response.status).toBe(400)
  })
})
