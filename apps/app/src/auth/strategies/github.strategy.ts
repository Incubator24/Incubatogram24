import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-github2'
import { AuthService } from '../auth.service'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../config/configuration'

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(
        private authService: AuthService,
        protected configService: ConfigService<ConfigType, true>
    ) {
        super({
            clientID: configService.get<string>('GITHUB_CLIENT_ID'),
            clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
            callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
            scope: ['user:email'],
        })
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: any, user: any) => void
    ) {
        try {
            const user = await this.authService.validateOAuthLogin(
                profile,
                'github'
            )
            done(null, user)
        } catch (err) {
            done(err, false)
        }
    }
}
