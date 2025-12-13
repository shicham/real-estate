declare module 'nodemailer' {
  export interface Transporter {
    sendMail(mailOptions: any): Promise<any>
    verify(): Promise<boolean>
  }

  export interface SentMessageInfo {
    messageId: string
    [key: string]: any
  }

  export function createTransporter(options: any): Transporter
  export { createTransporter as createTransport }
}