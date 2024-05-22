import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from './config/congiguration'
import { HttpExceptionFilter } from './exceptionFilter'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.setGlobalPrefix('api/v1')
    app.enableCors()
    app.useGlobalFilters(new HttpExceptionFilter())
    const configService = app.get(ConfigService<ConfigType, true>)
    const port = configService.get<number>('PORT') || 5978
    await app.listen(port)
}

bootstrap().then()
