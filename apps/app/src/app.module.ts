import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'

const configModule = ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
})
@Module({
    imports: [configModule],
    controllers: [AppController],
    providers: [AppService, ConfigService],
})
export class AppModule {}
