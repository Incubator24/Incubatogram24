import {
    CreatedUserDto,
    EmailExpirationRawType,
} from '../../../../helpers/types'
import { EmailConfirmationType } from '../../../email/emailConfirmationType'

export abstract class IUserRepository {
    abstract findUserByLoginOrEmail(loginOrEmail: string): Promise<any | null>
    abstract findUserByLoginOrEmailWithEmailInfo(
        userName: string,
        email: string
    ): Promise<any>
    abstract findUserByEmail(email: string): Promise<any | null>
    abstract deleteUserByUserId(userId: number)
    abstract createUser(newUser: CreatedUserDto): Promise<number | null>
    abstract createEmailExpiration(
        emailConfirmDto: EmailConfirmationType,
        userId: number
    ): Promise<string | null>
    abstract async findUserByEmailCode(
        code: string
    ): Promise<EmailExpirationRawType | null>
}
