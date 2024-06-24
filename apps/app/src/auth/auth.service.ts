import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../config/configuration'
import { UsersService } from '../user/user.service'

@Injectable()
export class AuthService {
    constructor(
        protected configService: ConfigService<ConfigType, true>,
        private usersService: UsersService
    ) {}
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

    async validateOAuthLogin(profile: any, provider: string): Promise<any> {
        console.log(profile + '!!!!!')

        let user = await this.usersService.findByProviderId(
            profile.id,
            provider
        )

        if (!user) {
            user = await this.usersService.createOAuthUser(profile, provider)
        }

        return user
    }
}
