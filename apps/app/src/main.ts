import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from './config/configuration'
import { HttpExceptionFilter } from './exceptionFilter'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.setGlobalPrefix('api/v1')
    app.enableCors()
    app.useGlobalFilters(new HttpExceptionFilter())
    const configService = app.get(ConfigService<ConfigType, true>)
    const port = configService.get<number>('PORT') || 5978

    const config = new DocumentBuilder()
        .setTitle('API Documentation of Incubatogram')
        .setDescription('The API description of Incubatogram')
        .setVersion('1.0')
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api', app, document)

    await app.listen(port)
}

bootstrap().then()
