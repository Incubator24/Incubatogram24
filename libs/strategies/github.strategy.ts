import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from '../../apps/auth/src/application/auth.service'
import { Strategy } from 'passport-google-oauth20'
import Configuration from '../config/configuration'

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(private authService: AuthService) {
        super({
            clientID: Configuration.getConfiguration().GITHUB_CLIENT_ID,
            clientSecret: Configuration.getConfiguration().GITHUB_CLIENT_SECRET,
            callbackURL: Configuration.getConfiguration().GITHUB_CALLBACK_URL,
            scope: ['user:email'],
        })
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: any, user: any) => void
    ) {
        console.log('github = ', profile)
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
