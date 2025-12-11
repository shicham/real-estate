declare module 'nodemailer' {
  export type SendMailOptions = {
    from?: string
    to?: string | string[]
    subject?: string
    text?: string
    html?: string
    [key: string]: any
  }

  export type SentMessageInfo = {
    accepted?: string[]
    rejected?: string[]
    response?: string
    envelope?: any
    messageId?: string
    [key: string]: any
  }

  export interface Transporter {
    sendMail(mail: SendMailOptions): Promise<SentMessageInfo> | void
    verify?(): Promise<boolean> | void
    [key: string]: any
  }

  export function createTransport(config?: any): Transporter
  export function getTestMessageUrl(info: any): string | false

  const nodemailer: {
    createTransport: typeof createTransport
    getTestMessageUrl?: typeof getTestMessageUrl
    [key: string]: any
  }

  export default nodemailer
}