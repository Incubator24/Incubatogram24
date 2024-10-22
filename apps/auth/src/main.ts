import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { AppModule } from '../../app/src/app.module'
import { ConfigType } from '../../../libs/config/configuration'
import { appSettings } from '../../../libs/common/app.setting'

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        {
            transport: Transport.TCP,
        }
    )
    // const configService = app.get(ConfigService<ConfigType, true>)
    // const port = configService.get<number>('PORT')
    // appSettings(app)
    await app.listen()
}

bootstrap().then()
