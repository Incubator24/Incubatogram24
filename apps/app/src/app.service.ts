import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from './config/configuration'

@Injectable()
export class AppService {
    constructor(protected configService: ConfigService<ConfigType, true>) {}
    getHello(): string {
        return (
            'Hello World, ' +
            `${this.configService.get<string>('CITY', 'Moscow')}`
        )
    }

    sayGoodbay(): string {
        return 'Goodbay,  World 123456'
    }
}
