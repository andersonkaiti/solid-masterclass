export interface SendNotificationStrategy {
  send(): Promise<void>
}

export interface NotificationTracker {
  trackDeliver(): Promise<void>
}

export class SendWhatsAppNotification
  implements SendNotificationStrategy, NotificationTracker
{
  async send(): Promise<void> {
    return Promise.resolve()
  }

  trackDeliver(): Promise<void> {
    return Promise.resolve()
  }
}

export class SendEmailNotification implements SendNotificationStrategy {
  async send(): Promise<void> {
    return Promise.resolve()
  }
}

export class SendSMSNotification implements SendNotificationStrategy {
  async send(): Promise<void> {
    return Promise.resolve()
  }
}

export class SendPushNotification implements SendNotificationStrategy {
  async send(): Promise<void> {
    return Promise.resolve()
  }
}
