import { Injectable } from '@nestjs/common'
import {
    EmailExpiration,
    PasswordRecovery,
    Profile,
    User,
} from '@prisma/client'
import { CreateProfileDto } from '../../api/dto/CreateProfileDto'
import { UpdateProfileDto } from '../../api/dto/UpdateProfileDto'
import { PrismaService } from '../../../../../../../prisma/prisma.service'
import {
    CreatedUserDto,
    CreatedUserWithGithubProviderDto,
    CreatedUserWithGoogleProviderDto,
} from '../../../../helpers/types/types'
import {
    EmailConfirmationType,
    EmailExpirationDto,
} from '../../../../helpers/types/emailConfirmationType'
import { IUserRepository } from '../interfaces/user.repository.interface'
import {
    PasswordRecoveryDto,
    UpdatePasswordDto,
} from '../../../../helpers/types/passwordRecoveryDto'

type GetFullInfoModelType = { user: User; emailExpiration: EmailExpiration }

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(private prisma: PrismaService) {}

    // async findUserById(userId: number): Promise<any | null> {
    //     const foundUser = await this.prisma.user.findUnique({
    //         where: {
    //             id: userId,
    //         },
    //         include: {
    //             Profile: true,
    //         },
    //     })
    //     if (!foundUser) {
    //         return null
    //     }
    //
    //     const avatarId = foundUser.Profile?.avatarId || null
    //
    //     return {
    //         id: foundUser.id,
    //         userName: foundUser.userName,
    //         name: foundUser.userName,
    //         email: foundUser.email,
    //         createdAt: foundUser.createdAt,
    //         avatarId: avatarId,
    //     }
    // }
    // async findUserById(userId: number): Promise<any | null> {
    //     const foundUser: any = (await this.prisma.user.findUnique({
    //         where: {
    //             id: userId,
    //         },
    //         include: {
    //             Profile: true,
    //         },
    //     })) as User
    //     if (!foundUser) {
    //         return null
    //     }
    //
    //     const avatarId = foundUser.Profile?.avatarId || null
    //
    //     return {
    //         id: foundUser.id,
    //         userName: foundUser.userName,
    //         name: foundUser.userName,
    //         email: foundUser.email,
    //         createdAt: foundUser.createdAt,
    //         avatarId: avatarId,
    //     }
    // }
    async findUserById(userId: number): Promise<any | null> {
        const foundUser: any = (await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        })) as User
        if (!foundUser) {
            return null
        }
        return {
            id: foundUser.id,
            userName: foundUser.userName,
            name: foundUser.userName,
            email: foundUser.email,
            createdAt: foundUser.createdAt,
            avatarId: foundUser.avatarId,
        }
    }
    async foundProfileFromUserId(userId: number): Promise<Profile | null> {
        return this.prisma.profile.findFirst({
            where: { userId: userId },
        })
    }

    // async createUser(newUser: Prisma.UserCreateInput): Promise<number | null> {
    //     const createdUser = await this.prisma.user.create({
    //         data: newUser,
    //     })
    //     if (createdUser.id) {
    //         return createdUser.id
    //     }
    //     return null
    // }

    async createUser(newUser: CreatedUserDto): Promise<number | null> {
        const createdUser = (await this.prisma.user.create({
            data: newUser,
        })) as User
        if (createdUser.id) {
            return createdUser.id
        }
        return null
    }

    async createUserWithGoogleProvider(
        createUserWithGoogleProvider: CreatedUserWithGoogleProviderDto
    ): Promise<number | null> {
        const createdUser = (await this.prisma.user.create({
            data: createUserWithGoogleProvider,
        })) as User
        if (createdUser.id) {
            return createdUser.id
        }
        return null
    }

    async createUserWithGithubProvider(
        createUserWithGithubProvider: CreatedUserWithGithubProviderDto
    ): Promise<number | null> {
        const createdUser = (await this.prisma.user.create({
            data: createUserWithGithubProvider,
        })) as User
        if (createdUser.id) {
            return createdUser.id
        }
        return null
    }

    async deleteUser(id: number): Promise<boolean> {
        try {
            await this.prisma.user.delete({
                where: { id: id },
            })
            return true
        } catch (e) {
            return false
        }
    }

    async updateAvatarId(userId: number, url: string) {
        console.log('userId = ', userId)
        const foundProfiles = await this.prisma.profile.findMany()
        console.log('foundProfiles = ', foundProfiles)
        const updateAvatarUrlForCurrentUser = (await this.prisma.profile.update(
            {
                where: {
                    userId: userId,
                },
                data: {
                    avatarId: url,
                },
            }
        )) as Profile
        return updateAvatarUrlForCurrentUser
            ? updateAvatarUrlForCurrentUser.avatarId === url
            : false
    }

    async deleteAvatarId(userId: number) {
        const updateAvatarUrlForCurrentUser = await this.prisma.profile.update({
            where: {
                userId: userId,
            },
            data: {
                avatarId: null,
            },
        })
        return updateAvatarUrlForCurrentUser
            ? updateAvatarUrlForCurrentUser.avatarId === null
            : false
    }

    async findUserByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: {
                email: email,
            },
        })
    }

    async findUserByLoginOrEmail(loginOrEmail: string): Promise<any | null> {
        return this.prisma.user.findFirst({
            where: {
                OR: [{ email: loginOrEmail }, { userName: loginOrEmail }],
            },
        })
    }

    async findFullInfoUserAndEmailInfo(
        loginOrEmail: string
    ): Promise<any | null> {
        const fullInfo = await this.prisma.emailExpiration.findFirst({
            select: {
                user: true,
                confirmationCode: true,
                emailExpiration: true,
                isConfirmed: true,
            },
            where: {
                user: {
                    OR: [{ userName: loginOrEmail }, { email: loginOrEmail }],
                },
            },
        })
        if (fullInfo && fullInfo.user) {
            return {
                id: fullInfo[0].user.id,
                login: fullInfo[0].user.login,
                email: fullInfo[0].user.email,
                createdAt: fullInfo[0].user.createdAt,
                passwordSalt: fullInfo[0].user.passwordSalt,
                passwordHash: fullInfo[0].user.passwordHash,
                confirmationCode: fullInfo[0].confirmationCode,
                emailExpiration: fullInfo[0].emailExpiration,
                isConfirmed: fullInfo[0].isConfirmed,
            }
        }

        return null
    }

    // async findUserByLoginOrEmailWithEmailInfo(
    //     userName: string,
    //     email: string
    // ): Promise<any> {
    //     return this.prisma.user.findFirst({
    //         where: {
    //             OR: [{ email: email }, { userName: userName }],
    //         },
    //         include: {
    //             emailConfirmationUser: {
    //                 select: {
    //                     id: true,
    //                     confirmationCode: true,
    //                     emailExpiration: true,
    //                     isConfirmed: true,
    //                 },
    //             },
    //         },
    //     })
    // }

    async findUserByLoginOrEmailWithEmailInfo(
        userName: string,
        email: string
    ): Promise<any> {
        return this.prisma.user.findFirst({
            where: {
                OR: [{ email: email }, { userName: userName }],
            },
            include: {
                EmailExpiration: {
                    select: {
                        id: true,
                        confirmationCode: true,
                        emailExpiration: true,
                        isConfirmed: true,
                    },
                },
            },
        })
    }

    // async findFullInfoUserAndEmailInfoById(
    //     userId: number
    // ): Promise<UserWithEmailViewModel | null> {
    //     const id = Number(userId)
    //     if (isNaN(id)) return null
    //     const fullInfo = (await this.prisma.emailExpiration.findFirst({
    //         include: {
    //             user: true,
    //             confirmationCode: true,
    //             emailExpiration: true,
    //             isConfirmed: true,
    //         },
    //
    //         where: {
    //             userId: id,
    //         },
    //     })) as GetFullInfoModelType
    //     console.log('fullInfo = ', fullInfo)
    //     if (fullInfo && fullInfo.user) {
    //         return {
    //             id: fullInfo.user.id,
    //             login: fullInfo.user.userName,
    //             email: fullInfo.user.email,
    //             createdAt: fullInfo.user.createdAt,
    //             passwordHash: fullInfo.user.passwordHash,
    //             passwordSalt: fullInfo.user.passwordSalt,
    //             confirmationCode: fullInfo.confirmationCode,
    //             emailExpiration: fullInfo.emailExpiration,
    //             isConfirmed: fullInfo.isConfirmed,
    //         }
    //     }
    //
    //     return null
    // }

    // async sendEmailConfirmation(
    //     emailConfirmationInfo: emailConfirmationType
    // ): Promise<any | null> {
    //     const sentEmailConfirmation =
    //         await this.prisma.emailConfirmationUser.create({
    //             data: {
    //                 userId: emailConfirmationInfo.userId,
    //                 confirmationCode: emailConfirmationInfo.confirmationCode,
    //                 emailExpiration: emailConfirmationInfo.emailExpiration,
    //                 isConfirmed: emailConfirmationInfo.isConfirmed,
    //             },
    //         })
    //
    //     if (sentEmailConfirmation) {
    //         return this.prisma.emailConfirmationUser.findFirst({
    //             where: {
    //                 id: sentEmailConfirmation.id,
    //             },
    //         })
    //     }
    //     return null
    // }

    async createEmailExpiration(
        emailConfirmDto: EmailConfirmationType,
        userId: number
    ): Promise<string | null> {
        const createdEmailExp = (await this.prisma.emailExpiration.create({
            data: {
                user: {
                    connect: { id: userId },
                },
                confirmationCode: emailConfirmDto.confirmationCode,
                emailExpiration: emailConfirmDto.emailExpiration,
                isConfirmed: emailConfirmDto.isConfirmed,
            },
        })) as EmailExpiration
        if (createdEmailExp) {
            return createdEmailExp.confirmationCode
        } else {
            return null
        }
    }
    async createRecoveryCode(
        passRecoveryDto: PasswordRecoveryDto,
        userId: number
    ): Promise<string | null> {
        const createdPasswordRecovery =
            (await this.prisma.passwordRecovery.create({
                data: {
                    user: {
                        connect: { id: userId },
                    },
                    recoveryCode: passRecoveryDto.recoveryCode,
                    expirationAt: passRecoveryDto.expirationAt,
                },
            })) as PasswordRecovery
        if (createdPasswordRecovery) {
            return createdPasswordRecovery.recoveryCode
        } else {
            return null
        }
    }
    // async updateConfirmationCode(
    //     userId: number,
    //     code: string
    // ): Promise<boolean> {
    //     const emailConfirmation = add(new Date(), {
    //         hours: 2,
    //         minutes: 3,
    //     }).toISOString()
    //     const updatedConfirmationCode =
    //         await this.prisma.emailExpiration.updateMany({
    //             where: { userId: userId },
    //             data: {
    //                 confirmationCode: code,
    //                 emailExpiration: emailConfirmation,
    //             },
    //         })
    //
    //     return updatedConfirmationCode.count > 0
    // }

    async updateEmailConfirmationCode(
        id: number,
        newEmailConfirmationDto: EmailExpirationDto
    ) {
        return this.prisma.emailExpiration.update({
            where: { id: id },
            data: newEmailConfirmationDto,
        })
    }

    async updatePasswordRecoveryCode(
        userId: number,
        newPasswordRecoveryDto: PasswordRecoveryDto
    ) {
        return this.prisma.passwordRecovery.update({
            where: { userId: userId },
            data: newPasswordRecoveryDto,
        })
    }

    async updatePassword(userId: number, updatePasswordDto: UpdatePasswordDto) {
        return this.prisma.user.update({
            where: { id: userId },
            data: updatePasswordDto,
        })
    }

    async createProfile(userId: number, createProfileDto: CreateProfileDto) {
        const { userName, firstName, lastName, dateOfBirth, city, aboutMe } =
            createProfileDto
        const profile = await this.prisma.profile.create({
            data: {
                user: {
                    connect: { id: userId },
                },
                firstName,
                lastName,
                dateOfBirth: new Date(dateOfBirth),
                city,
                aboutMe,
            },
        })

        if (userName) {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    userName: createProfileDto.userName,
                },
            })
        }

        return profile
    }

    async updateProfile(changeProfileDto: UpdateProfileDto, userId: number) {
        const dataToUpdateProfile: any = {
            dateOfBirth: new Date(changeProfileDto.dateOfBirth),
        }

        if (changeProfileDto.firstName) {
            dataToUpdateProfile.firstName = changeProfileDto.firstName
        }

        if (changeProfileDto.lastName) {
            dataToUpdateProfile.lastName = changeProfileDto.lastName
        }

        if (changeProfileDto.aboutMe) {
            dataToUpdateProfile.aboutMe = changeProfileDto.aboutMe
        }
        if (changeProfileDto.city) {
            dataToUpdateProfile.city = changeProfileDto.city
        }
        const updateProfile = await this.prisma.profile.updateMany({
            where: { id: userId },
            data: dataToUpdateProfile,
        })

        const dataToUpdateUser: any = {}

        if (changeProfileDto.userName) {
            dataToUpdateUser.userName = changeProfileDto.userName
        }

        if (changeProfileDto.userName) {
            await this.prisma.user.update({
                where: { id: userId },
                data: dataToUpdateUser,
            })
        }

        return updateProfile
    }

    async findUserByCode(code: string): Promise<EmailExpiration | null> {
        const userEmailConfirmationData =
            await this.prisma.emailExpiration.findFirst({
                where: {
                    confirmationCode: code,
                },
            })
        return userEmailConfirmationData!.userId
            ? userEmailConfirmationData
            : null
    }

    async findUserByEmailCode(code: string): Promise<EmailExpiration | null> {
        console.log('code = ', code)
        const userEmailConfirmationData =
            (await this.prisma.emailExpiration.findFirst({
                where: {
                    confirmationCode: code,
                },
            })) as EmailExpiration
        if (userEmailConfirmationData) {
            return {
                id: userEmailConfirmationData.id,
                confirmationCode: userEmailConfirmationData.confirmationCode,
                emailExpiration: userEmailConfirmationData.emailExpiration,
                isConfirmed: userEmailConfirmationData.isConfirmed,
                userId: userEmailConfirmationData.userId,
            }
        } else {
            return null
        }
    }

    async findEmailConfirmationByUserId(
        userId: number
    ): Promise<EmailExpiration | null> {
        return this.prisma.emailExpiration.findFirst({
            where: {
                userId: userId,
            },
        })
    }

    async isConfirmEmail(userId: number): Promise<boolean> {
        const emailExpiration = (await this.prisma.emailExpiration.findFirst({
            where: { userId: userId },
            select: { isConfirmed: true },
        })) as EmailExpiration
        return emailExpiration ? emailExpiration.isConfirmed : false
    }
    async findUserByGoogleId(googleId: string) {
        return this.prisma.user.findFirst({
            where: {
                googleId: googleId,
            },
        })
    }
    async findUserByGithubId(githubId: string) {
        return this.prisma.user.findFirst({
            where: {
                githubId: githubId,
            },
        })
    }
    async updateGoogleProvider(
        userId: number,
        googleEmail: string,
        googleId?: string
    ) {
        const data: any = { googleEmail: googleEmail }
        if (googleId) {
            data.googleId = googleId
        }
        return this.prisma.user.update({
            where: {
                id: userId,
            },
            data: data,
        })
    }

    async updateGithubProvider(
        userId: number,
        githubEmail: string,
        githubId?: string
    ) {
        const data: any = { githubEmail: githubEmail }
        if (githubId) {
            data.githubId = githubId
        }
        return this.prisma.user.update({
            where: {
                id: userId,
            },
            data: data,
        })
    }
    async findUserIdByUserId(userId: string): Promise<number | null> {
        const id = Number(userId)
        if (isNaN(id)) return null
        const foundUserId = (await this.prisma.user.findUnique({
            where: {
                id: id,
            },
        })) as User
        return foundUserId ? foundUserId.id : null
    }
    async deleteUserByUserId(userId: number) {
        const foundUser = await this.prisma.user.findUnique({
            where: { id: userId },
        })
        if (foundUser) {
            // Получаем профиль пользователя
            const profile = (await this.prisma.profile.findUnique({
                where: { userId },
            })) as Profile

            // Если профиль существует, удаляем его
            if (profile) {
                await this.prisma.profile.delete({
                    where: { userId: profile.userId },
                })
            }
            // Удаляем все устройства, связанные с пользователем
            await this.prisma.device.deleteMany({
                where: { userId: userId },
            })
            await this.prisma.emailExpiration.deleteMany({
                where: { userId: userId },
            })
            await this.prisma.passwordRecovery.deleteMany({
                where: { userId: userId },
            })
            await this.prisma.user.delete({
                where: { id: userId },
            })
        } else {
            return 'user not found'
        }
    }

    // for testing RemoveAll

    async deleteAllProfile() {
        await this.prisma.profile.deleteMany({})
    }

    async deleteAllEmailData() {
        await this.prisma.emailExpiration.deleteMany({})
    }

    async deletePassRecovery() {
        await this.prisma.passwordRecovery.deleteMany({})
    }

    async deleteAllUsers() {
        await this.prisma.user.deleteMany({})
    }
}
