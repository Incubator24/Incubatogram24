import * as nodemailer from 'nodemailer'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../config/configuration'
import { Injectable } from '@nestjs/common'

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter

    constructor(
        private readonly configService: ConfigService<ConfigType, true>
    ) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get('EMAIL_SERVICE_USER'), // замените на ваш email
                pass: this.configService.get('EMAIL_SERVICE_PASSWORD_USER'), // замените на ваш пароль или app password
            },
        })
    }

    async sendConfirmationEmail(confirmationCode: string, email: string) {
        // const transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         user: 'incubator2404@gmail.com', // generated ethereal user
        //         pass: 'kzwougluujijgrmm', // generated ethereal password
        //     },
        // })

        const url = `https://app.incubatogram.org/api/v1/auth/confirm?code=${confirmationCode}`

        return await this.transporter.sendMail({
            from: `Incubatogram <incubator2404@gmail.com>`, // sender address
            to: email, // list of receivers
            subject: 'Email Confirmation', // Subject line
            html: ` <h1>Thank for your registration</h1>
 <p>To finish registration please follow the link below:
     <a href="${url}" >complete registration</a>
 </p>`, // html body
        })
    }

    async sendRecoveryPasswordEmail(recoveryCode: string, email: string) {
        const url = `https://app.incubatogram.org/api/v1/auth/new-password?code=${recoveryCode}`

        // send mail with defined transport object
        const info = await this.transporter.sendMail({
            from: `Incubatogram <incubator2404@gmail.com>`, // sender address
            to: email, // list of receivers
            subject: 'Password recovery', // Subject line
            html: ` <h1>Password recovery</h1>
 <p>To finish password recovery please follow the link below:
     <a href="${url}">complete registration</a>
 </p>`, // html body
        })
        return info
    }
}
