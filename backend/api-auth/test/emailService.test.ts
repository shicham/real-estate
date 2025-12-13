import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()
// Mocks pour nodemailer (définis avant d'importer le service)
const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
const verifyMock = jest.fn().mockResolvedValue(true)

const createTransportMock = jest.fn().mockImplementation(() => ({
  sendMail: sendMailMock,
  verify: verifyMock
}))

// Mock du module nodemailer : on expose createTransport à la fois comme export nommé et comme default
jest.mock('nodemailer', () => {
  const mocked = {
    createTransport: createTransportMock
  }
  return {
    __esModule: true,
    default: mocked,
    ...mocked
  }
})

// Importer le singleton après le mock (important)
import emailService from '../src/services/emailService.js'

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call nodemailer.sendMail and send an email to sass.hicham@gmail.com', async () => {
    const to = 'sass.hicham@gmail.com'
    const subject = 'Test email'
    const html = '<p>Ceci est un test</p>'
    const text = 'Ceci est un test'
console.log('SMTP_PORT',process.env.SMTP_PORT)
console.log('SMTP_HOST',process.env.SMTP_HOST)
console.log('SMTP_USER',process.env.SMTP_USER)
    const info = await emailService.sendEmail(to, subject, html, text)

    // sendMail doit avoir été appelé une fois
    expect(sendMailMock).toHaveBeenCalledTimes(1)

    // Vérifier que sendMail a été appelé avec un objet contenant le destinataire et le sujet attendus
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to,
        subject,
        html,
        text,
        from: expect.any(String)
      })
    )

    // Retour attendu (mock)
    expect(info).toEqual(expect.objectContaining({ messageId: 'test-message-id' }))
  })
})