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
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:5000',
            'https://incubatogram.org',
            'https://app.incubatogram.org/api/v1',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
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
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT Bearer token only',
                in: 'header',
            },
            'JWT-auth'
        )
        .addCookieAuth('refreshToken', {
            type: 'apiKey',
            in: 'cookie',
            name: 'refreshToken',
            description:
                'JWT refreshToken inside cookie. Must be correct, and must not expire',
        })
        .addBasicAuth({
            type: 'http',
            scheme: 'basic',
            description: 'basic',
        })
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/v1/swagger', app, document)
}
