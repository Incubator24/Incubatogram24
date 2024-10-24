import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { UsersService } from '../../../app/src/modules/user/application/user.service'
import { IUserRepository } from '../../../app/src/modules/user/infrastructure/interfaces/user.repository.interface'
import Configuration from '../../../../libs/config/configuration'
import {
    CreatedEmailDto,
    CreatedUserWithGithubProviderDto,
    CreatedUserWithGoogleProviderDto,
} from '../../../../libs/helpers/types/types'
import {
    createEmailDto,
    createPassDto,
} from '../../../../libs/helpers/functions'
import { PasswordRecoveryDto } from '../../../../libs/helpers/types/passwordRecoveryDto'

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private userRepository: IUserRepository
    ) {}
    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    }
    async addInvalidAccessToken(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    }
    getHello(): string {
        return 'Hello World, ' + `${Configuration.getConfiguration().CITY}`
    }

    // async validateOAuthLogin(profile: any, provider: string): Promise<any> {
    //     console.log('profileId = ', profile.id)
    //     console.log('email = ', profile.emails[0].value)
    //
    //     let user = await this.usersService.findByProviderId(
    //         profile.id,
    //         provider
    //     )
    //
    //     if (!user) {
    //         user = await this.usersService.createOAuthUser(profile, provider)
    //     }
    //
    //     return user
    // }

    async validateOAuthLogin(profile: any, provider: string): Promise<any> {
        if (provider === 'google') {
            const email = profile.emails[0].value
            const foundUser = await this.userRepository.findUserByEmail(email)
            if (foundUser) {
                if (foundUser.googleId) {
                    return { id: foundUser.id }
                } else {
                    await this.userRepository.updateGoogleProvider(
                        foundUser.id,
                        email,
                        foundUser.googleId
                    )
                    return { id: foundUser.id }
                }
            } else {
                const createUserWithGoogleProvider: CreatedUserWithGoogleProviderDto =
                    {
                        email: email,
                        userName: await this.usersService.makeUniqueUserName(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        isDeleted: false,
                        googleId: profile.id,
                        googleEmail: email,
                    }
                const createdUserId =
                    await this.userRepository.createUserWithGoogleProvider(
                        createUserWithGoogleProvider
                    )
                // создаем объект для восстановления пароля
                const passRecoveryDto: PasswordRecoveryDto = createPassDto()
                await this.userRepository.createRecoveryCode(
                    passRecoveryDto,
                    createdUserId
                )
                // создаем объект для отправки кода на мыло
                const emailConfirmationInfo: CreatedEmailDto =
                    createEmailDto(true)

                await this.userRepository.createEmailExpiration(
                    emailConfirmationInfo,
                    createdUserId
                )
                return { id: createdUserId }
            }
        } else {
            const foundUser = await this.userRepository.findUserByEmail(
                profile.email
            )
            if (foundUser) {
                if (foundUser.githubId) {
                    return { id: foundUser.id }
                } else {
                    await this.userRepository.updateGithubProvider(
                        foundUser.id,
                        profile.email,
                        foundUser.githubId
                    )
                    return { id: foundUser.id }
                }
            } else {
                const createUserWithGithubProvider: CreatedUserWithGithubProviderDto =
                    {
                        email: profile.email,
                        userName: await this.usersService.makeUniqueUserName(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        isDeleted: false,
                        githubId: profile.id,
                        githubEmail: profile.email,
                    }
                const createdUserId =
                    await this.userRepository.createUserWithGithubProvider(
                        createUserWithGithubProvider
                    )
                // создаем объект для восстановления пароля
                const passRecoveryDto: PasswordRecoveryDto = createPassDto()
                await this.userRepository.createRecoveryCode(
                    passRecoveryDto,
                    createdUserId
                )
                // создаем объект для отправки кода на мыло
                const emailConfirmationInfo: CreatedEmailDto =
                    createEmailDto(true)

                await this.userRepository.createEmailExpiration(
                    emailConfirmationInfo,
                    createdUserId
                )
                return { id: createdUserId }
            }
        }
    }
}
