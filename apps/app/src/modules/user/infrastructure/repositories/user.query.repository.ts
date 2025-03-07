import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../../../../prisma/prisma.service'
import {
    ProfileViewModel,
    UserViewModel,
} from '../../../../../../../libs/helpers/types/types'
import Configuration from '../../../../../../../libs/config/configuration'
import { User } from '@prisma/client'

@Injectable()
export class UserQueryRepository {
    constructor(private prisma: PrismaService) {}

    // async findUserById(userId: number): Promise<any | null> {
    //     const foundUser = await this.prisma.user.findUnique({
    //         where: {
    //             id: userId,
    //         },
    //         include: {
    //             Profile: true,
    //             EmailExpiration: true,
    //         },
    //     })
    //     if (!foundUser) {
    //         return null
    //     }
    //     const avatarId = foundUser.Profile?.avatarId || null
    //     const profile = foundUser.Profile ? foundUser.Profile : null
    //     const isConfirmEmail =
    //         foundUser.EmailExpiration.length > 0
    //             ? foundUser.EmailExpiration[0].isConfirmed
    //             : null
    //
    //     return {
    //         id: foundUser.id,
    //         userName: foundUser.userName,
    //         name: foundUser.userName,
    //         email: foundUser.email,
    //         createdAt: foundUser.createdAt,
    //         avatarId: avatarId,
    //         isConfirmEmail: isConfirmEmail,
    //         profile: profile,
    //     }
    // }

    async findUserById(userId: number) {
        return this.prisma.user.findFirst({
            where: { id: userId },
            select: {
                id: true,
                userName: true,
                email: true,
                createdAt: true,
                Profile: true,
            },
        })
    }

    // async getProfile(userId: number): Promise<ProfileViewModel> {
    //     const result = await this.prisma.user.findFirst({
    //         where: { id: userId },
    //         select: {
    //             id: true,
    //             email: true,
    //             createdAt: true,
    //             updatedAt: true,
    //             Profile: true,
    //             EmailExpiration: true,
    //         },
    //     })
    //     return {
    //         userId: result.id,
    //         email: result.email,
    //         emailIsConfirm: result.EmailExpiration.isConfirmed,
    //         createdAt: result.createdAt.toString(),
    //         updatedAt: result.updatedAt.toString(),
    //         profile: {
    //             firstName: result.Profile.firstName,
    //             lastName: result.Profile.lastName,
    //             dateOfBirth: result.Profile.dateOfBirth.toString(),
    //             country: result.Profile.country,
    //             city: result.Profile.city,
    //             aboutMe: result.Profile.aboutMe,
    //             avatarId: result.Profile.avatarId,
    //         },
    //     }
    // }

    async getUserByUserId(userId: number): Promise<UserViewModel> {
        const result = await this.prisma.user.findFirst({
            where: { id: userId },
        })
        if (result) {
            return {
                id: result.id,
                userName: result.userName,
                email: result.email,
                isBlocked: result.isDeleted,
            }
        } else {
            return null
        }
    }

    // async getProfile(userId: number): Promise<ProfileViewModel | null> {
    //     console.log(1)
    //     const result = await this.prisma.user.findFirst({
    //         where: { id: userId },
    //         select: {
    //             id: true,
    //             userName: true,
    //             email: true,
    //             createdAt: true,
    //             updatedAt: true,
    //             Profile: true,
    //             EmailExpiration: true,
    //         },
    //     })
    //     if (!result) {
    //         return null
    //     }
    //     const countPosts = await this.prisma.post.count({
    //         where: { profileId: result.Profile?.id ?? 0, isDraft: false },
    //     })
    //     if (result) {
    //         return {
    //             id: result.id,
    //             userName: result.userName,
    //             email: result.email,
    //             emailIsConfirm: result.EmailExpiration.isConfirmed,
    //             createdAt: result.createdAt.toString(),
    //             updatedAt: result.updatedAt.toString(),
    //             profile: result.Profile
    //                 ? {
    //                       firstName: result.Profile.firstName,
    //                       lastName: result.Profile.lastName,
    //                       dateOfBirth: result.Profile.dateOfBirth.toString(),
    //                       country: result.Profile.country,
    //                       city: result.Profile.city,
    //                       aboutMe: result.Profile.aboutMe,
    //                       url: result.Profile.avatarId
    //                           ? Configuration.getConfiguration()
    //                                 .YANDEX_S3_ENDPOINT_WITH_BUCKET +
    //                             result.Profile.avatarId
    //                           : null,
    //                   }
    //                 : null,
    //             //todo пока что заглушка для фронтов, потому что нет еще функционала подписок
    //             followingCount: 0,
    //             followersCount: 0,
    //             publicationsCount: countPosts ?? 0,
    //         }
    //     } else {
    //         return null
    //     }
    // }

    async getProfile(userId: number): Promise<ProfileViewModel | null | any> {
        const result = await this.prisma.user.findFirst({
            where: { id: userId },
            include: {
                Profile: true,
                EmailExpiration: true, // Включает связанные записи из EmailExpiration
                PasswordRecovery: true, // Включает связанные записи из PasswordRecovery
            },
        })
        const countPosts = await this.prisma.post.count({
            where: { profileId: result.Profile?.id ?? 0, isDraft: false },
        })
        console.log('result = ', result)
        if (!result) {
            return null
        }
        if (result) {
            return {
                id: result.id,
                email: result.email,
                emailIsConfirm: result.EmailExpiration.isConfirmed,
                userName: result.userName,
                firstName: result.Profile.firstName,
                lastName: result.Profile.lastName,
                city: result.Profile.city,
                country: result.Profile.country,
                dateOfBirth: result.Profile.dateOfBirth,
                aboutMe: result.Profile.aboutMe,
                avatarUrl: result.Profile.avatarId
                    ? Configuration.getConfiguration()
                          .YANDEX_S3_ENDPOINT_WITH_BUCKET +
                      result.Profile.avatarId
                    : null,
                createdAt: result.createdAt,
                //todo пока что заглушка для фронтов, потому что нет еще функционала подписок
                followingCount: 0,
                followersCount: 0,
                publicationsCount: countPosts ?? 0,
            }
        } else {
            return null
        }
    }

    // for test
    async getAllUsers() {
        const result = await this.prisma.user.findMany({
            select: {
                id: true,
                userName: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                Profile: true,
                EmailExpiration: true,
            },
        })

        if (result) {
            return result.map((r) => ({
                id: r.id,
                userName: r.userName,
                email: r.email,
                emailIsConfirm: r.EmailExpiration.isConfirmed,
                createdAt: r.createdAt.toString(),
                updatedAt: r.updatedAt.toString(),
                profile: r.Profile
                    ? {
                          firstName: r.Profile.firstName,
                          lastName: r.Profile.lastName,
                          dateOfBirth: r.Profile.dateOfBirth.toString(),
                          country: r.Profile.country,
                          city: r.Profile.city,
                          aboutMe: r.Profile.aboutMe,
                          avatarId: r.Profile.avatarId,
                      }
                    : null,
            }))
        }

        return []
    }
}
