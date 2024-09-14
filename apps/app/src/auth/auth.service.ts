import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import Configuration from '../config/configuration'
import { UsersService } from '../user/user.service'

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    }

    async addInvalidAccessToken(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    }

    getHello(): string {
        return 'Hello World, ' + `${Configuration.getConfiguration().CITY}`
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
