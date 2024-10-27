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
                host: '0.0.0.0',
                port: Configuration.getConfiguration().AUTH_SERVICE_PORT,
            },
        }
    )
    // const configService = app.get(ConfigService<ConfigType, true>)
    // const port = configService.get<number>('PORT')
    // appSettings(app)
    console.log(
        'Configuration.getConfiguration().AUTH_SERVICE_PORT',
        Configuration.getConfiguration().AUTH_SERVICE_PORT
    )
    await app.listen()
}

bootstrap().then()
