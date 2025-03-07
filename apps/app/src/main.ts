import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../libs/config/configuration'
import { appSettings } from '../../../libs/common/app.setting'

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { rawBody: true })
    const configService = app.get(ConfigService<ConfigType, true>)
    const port = configService.get<number>('PORT')
    appSettings(app)
    await app.listen(port)
}

bootstrap().then()
