import { eq } from 'drizzle-orm'
import { db } from '../db/client.ts'
import { usersTable } from '../db/schema.ts'

type User = typeof usersTable.$inferSelect

export class UserDAO {
  async findByEmail(email: string): Promise<User> {
    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))

    return existingUser
  }

  async create(user: User): Promise<User> {
    const [existingUser] = await db.insert(usersTable).values(user).returning()

    return existingUser
  }
}
