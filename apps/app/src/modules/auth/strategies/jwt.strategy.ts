import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import Configuration from '../../../config/configuration'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        const secretOrKey = Configuration.getConfiguration().JWT_SECRET

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secretOrKey,
        })
    }

    async validate(payload: any) {
        return { userId: payload.userId }
    }
}
