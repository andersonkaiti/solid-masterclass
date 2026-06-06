export class PasswordsDoNotMatchError extends Error {
  constructor() {
    super('Password do not match')
  }
}
