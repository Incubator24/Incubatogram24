import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'
import { AuthService } from '../application/auth.service'
import Configuration from '../../../config/configuration'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private authService: AuthService) {
        super({
            clientID: Configuration.getConfiguration().GOOGLE_CLIENT_ID,
            clientSecret: Configuration.getConfiguration().GOOGLE_CLIENT_SECRET,
            callbackURL: Configuration.getConfiguration().GOOGLE_CALLBACK_URL,
            scope: ['email', 'profile'],
        })
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback
    ): Promise<any> {
        const user = await this.authService.validateOAuthLogin(
            profile,
            'google'
        )
        done(null, user)
    }
}
