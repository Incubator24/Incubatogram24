import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from './config/configuration'
import { appSettings } from './common/app.setting'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    const configService = app.get(ConfigService<ConfigType, true>)
    const port = configService.get<number>('PORT')
    //
    appSettings(app)
    await app.listen(port)
}

bootstrap().then()
