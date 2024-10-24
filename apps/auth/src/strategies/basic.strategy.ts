import { BasicStrategy as Strategy } from 'passport-http'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import Configuration from '../../../../libs/config/configuration'

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super()
    }

    public validate = async (username, password): Promise<boolean> => {
        if (
            Configuration.getConfiguration().HTTP_BASIC_USER === username &&
            Configuration.getConfiguration().HTTP_BASIC_PASS === password
        ) {
            return true
        }
        throw new UnauthorizedException()
    }
}
