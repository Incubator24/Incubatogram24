import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { AuthModule } from './auth.module'
import Configuration from '../../../libs/config/configuration'

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AuthModule,
        {
            transport: Transport.TCP,
            options: {
                host: Configuration.getConfiguration().AUTH_SERVICE_HOST,
                port: Configuration.getConfiguration().AUTH_SERVICE_PORT,
            },
        }
    )
    // const configService = app.get(ConfigService<ConfigType, true>)
    // const port = configService.get<number>('PORT')
    // appSettings(app)
    await app.listen()
}

bootstrap().then()
