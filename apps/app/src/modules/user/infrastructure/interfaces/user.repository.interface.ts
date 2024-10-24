import { EmailExpiration, Profile, User } from '@prisma/client'
import { CreateProfileDto } from '../../api/dto/CreateProfileDto'
import { UpdateProfileDto } from '../../api/dto/UpdateProfileDto'
import {
    CreatedUserDto,
    CreatedUserWithGithubProviderDto,
    CreatedUserWithGoogleProviderDto,
    EmailExpirationRawType,
} from '../../../../../../../libs/helpers/types/types'
import {
    EmailConfirmationType,
    EmailExpirationDto,
} from '../../../../../../../libs/helpers/types/emailConfirmationType'
import {
    PasswordRecoveryDto,
    UpdatePasswordDto,
} from '../../../../../../../libs/helpers/types/passwordRecoveryDto'

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
    abstract foundProfileFromUserId(userId: number): Promise<Profile | null>
    abstract isConfirmEmail(userId: number): Promise<boolean>
    abstract findUserByGoogleId(googleId: string)
    abstract findUserByGithubId(githubId: number)
    abstract updateGoogleProvider(
        userId: number,
        googleEmail: string,
        googleId?: string
    )
    abstract updateGithubProvider(
        userId: number,
        githubEmail: string,
        githubId?: number
    )
    abstract createProfile(userId: number, createProfileDto: CreateProfileDto)
    abstract updateProfile(changeProfileDto: UpdateProfileDto, userId: number)
    abstract createUser(newUser: CreatedUserDto): Promise<number | null>
    abstract createUserWithGoogleProvider(
        createUserWithGoogleProvider: CreatedUserWithGoogleProviderDto
    ): Promise<number | null>
    abstract createUserWithGithubProvider(
        createUserWithGithubProvider: CreatedUserWithGithubProviderDto
    ): Promise<number | null>
    abstract createEmailExpiration(
        emailConfirmDto: EmailConfirmationType,
        userId: number,
        confirm?: boolean
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
    abstract deleteAvatarId(userId: number)
    abstract deleteUserByUserId(userId: number)
}
