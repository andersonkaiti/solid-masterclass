import {
  SendEmailNotification,
  type SendNotificationStrategy,
  SendPushNotification,
  SendSMSNotification,
  SendWhatsAppNotification,
} from '../../resources/notifications/index.ts'
import type { User } from '../entities/user.ts'

export class SendNotificationFactory {
  static create(
    channel: User['preferredMarketingChannel'],
  ): SendNotificationStrategy {
    switch (channel) {
      case 'email':
        return new SendEmailNotification()
      case 'sms':
        return new SendSMSNotification()
      case 'push':
        return new SendPushNotification()
      case 'whatsapp':
        return new SendWhatsAppNotification()
      default:
        throw new Error('Invalid channel')
    }
  }
}
