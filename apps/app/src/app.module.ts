import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import Configuration from './config/congiguration'

const configModule = ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
    load: [Configuration.getConfiguration],
})
@Module({
    imports: [configModule],
    controllers: [AppController],
    providers: [AppService, ConfigService],
})
export class AppModule {}
