import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor() {}
    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    }
    async addInvalidAccessToken(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    }
}
