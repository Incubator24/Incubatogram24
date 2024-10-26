import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../../../../prisma/prisma.service'
import { ProfileViewModel } from '../../../../../../../libs/helpers/types/types'
import Configuration from '../../../../../../../libs/config/configuration'

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

    async getProfile(userId: number): Promise<ProfileViewModel | null> {
        const result = await this.prisma.user.findFirst({
            where: { id: userId },
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
            return {
                id: result.id,
                userName: result.userName,
                email: result.email,
                emailIsConfirm: result.EmailExpiration.isConfirmed,
                createdAt: result.createdAt.toString(),
                updatedAt: result.updatedAt.toString(),
                profile: result.Profile
                    ? {
                          firstName: result.Profile.firstName,
                          lastName: result.Profile.lastName,
                          dateOfBirth: result.Profile.dateOfBirth.toString(),
                          country: result.Profile.country,
                          city: result.Profile.city,
                          aboutMe: result.Profile.aboutMe,
                          url:
                              Configuration.getConfiguration()
                                  .YANDEX_S3_ENDPOINT_WITH_BUCKET +
                              result.Profile.avatarId,
                      }
                    : null,
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
