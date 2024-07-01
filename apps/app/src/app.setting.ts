import {
    BadRequestException,
    INestApplication,
    ValidationPipe,
} from '@nestjs/common'
import { HttpExceptionFilter } from './exceptionFilter'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'

export const appSettings = (app: INestApplication) => {
    app.setGlobalPrefix('api/v1')
    app.enableCors()
    app.use(cookieParser())
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            stopAtFirstError: true,
            exceptionFactory: (errorsMessages) => {
                const errorsForResponse: any = []

                errorsMessages.forEach((e) => {
                    const constraintsKeys = Object.keys(e.constraints!)
                    constraintsKeys.forEach((ckey) => {
                        errorsForResponse.push({
                            message: e.constraints![ckey],
                            field: e.property,
                        })
                    })
                })

                throw new BadRequestException(errorsForResponse)
            },
        })
    )
    app.useGlobalFilters(new HttpExceptionFilter())

    const config = new DocumentBuilder()
        .setTitle('API Documentation of Incubatogram')
        .setDescription('The API description of Incubatogram')
        .setVersion('1.0')
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/v1/swagger', app, document)
}
