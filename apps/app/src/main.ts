import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from './config/configuration'
import { HttpExceptionFilter } from './exceptionFilter'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { BadRequestException, ValidationPipe } from '@nestjs/common'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
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

    const configService = app.get(ConfigService<ConfigType, true>)
    const port = configService.get<number>('PORT')

    const config = new DocumentBuilder()
        .setTitle('API Documentation of Incubatogram')
        .setDescription('The API description of Incubatogram')
        .setVersion('1.0')
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api', app, document)
    console.log(port)
    await app.listen(port)
}

bootstrap().then()
