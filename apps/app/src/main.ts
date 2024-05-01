import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from './config/congiguration'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.setGlobalPrefix('api/v1')
    const configService = app.get(ConfigService<ConfigType, true>)
    const port = configService.get<number>('PORT') || 5978

    await app.listen(port)
}

bootstrap()
