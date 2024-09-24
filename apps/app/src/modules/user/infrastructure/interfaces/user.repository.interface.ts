import {
    CreatedUserDto,
    CreatedUserWithGithubProviderDto,
    CreatedUserWithGoogleProviderDto,
    EmailExpirationRawType,
} from '../../../../helpers/types/types'
import {
    EmailConfirmationType,
    EmailExpirationDto,
} from '../../../../helpers/types/emailConfirmationType'
import {
    PasswordRecoveryDto,
    UpdatePasswordDto,
} from '../../../../helpers/types/passwordRecoveryDto'
import { EmailExpiration, User } from '@prisma/client'

export abstract class IUserRepository {
    abstract findUserByLoginOrEmail(loginOrEmail: string): Promise<any | null>
    abstract findUserByLoginOrEmailWithEmailInfo(
        userName: string,
        email: string
    ): Promise<any>
    abstract findUserByEmail(email: string): Promise<User | null>
    abstract findUserById(userId: number): Promise<User | null>
    abstract findUserByEmailCode(
        code: string
    ): Promise<EmailExpirationRawType | null>
    abstract findEmailConfirmationByUserId(
        userId: number
    ): Promise<EmailExpiration | null>
    abstract findUserByGoogleId(googleId: string)
    abstract findUserByGithubId(githubId: string)
    abstract updateGoogleProvider(
        userId: number,
        googleEmail: string,
        googleId?: string
    )
    abstract updateGithubProvider(
        userId: number,
        githubEmail: string,
        githubId?: string
    )
    abstract createUser(newUser: CreatedUserDto): Promise<number | null>
    abstract createUserWithGoogleProvider(
        createUserWithGoogleProvider: CreatedUserWithGoogleProviderDto
    ): Promise<number | null>
    abstract createUserWithGithubProvider(
        createUserWithGithubProvider: CreatedUserWithGithubProviderDto
    ): Promise<number | null>
    abstract createEmailExpiration(
        emailConfirmDto: EmailConfirmationType,
        userId: number
    ): Promise<string | null>
    abstract createRecoveryCode(
        passRecoveryDto: PasswordRecoveryDto,
        userId: number
    )
    abstract updateEmailConfirmationCode(
        id: number,
        newEmailConfirmationDto: EmailExpirationDto
    )
    abstract updatePasswordRecoveryCode(
        userId: number,
        newPasswordRecoveryDto: PasswordRecoveryDto
    )
    abstract updatePassword(
        userId: number,
        updatePasswordDto: UpdatePasswordDto
    )
    abstract deleteUserByUserId(userId: number)
}
