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
    console.log(Configuration.getConfiguration().AUTH_SERVICE_PORT)
    await app.listen()
}

bootstrap().then()
