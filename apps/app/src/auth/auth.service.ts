import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../config/congiguration'

@Injectable()
export class AuthService {
    constructor(protected configService: ConfigService<ConfigType, true>) {}
    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    }
    async addInvalidAccessToken(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    }
    getHello(): string {
        return (
            'Hello World, ' +
            `${this.configService.get<string>('CITY', 'Moscow')}`
        )
    }
}
