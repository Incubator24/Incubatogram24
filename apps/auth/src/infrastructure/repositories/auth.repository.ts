import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../../prisma/prisma.service'
import { DeviceDBModel } from '../../../../app/src/modules/devices/device.types'

@Injectable()
export class AuthRepository {
    constructor(private prisma: PrismaService) {}

    async updateEmailConfirmation(userId: number): Promise<boolean> {
        const isUpdatedEmailConfirmation =
            await this.prisma.emailExpiration.updateMany({
                where: { userId: userId },
                data: { isConfirmed: true },
            })

        return isUpdatedEmailConfirmation.count
            ? isUpdatedEmailConfirmation.count >= 1
            : false
    }

    async findUserByConfirmationCode(code:string){
        const foundedUser = await this.prisma.emailExpiration.findFirst(
            {
                where: {confirmationCode: code},
                include: {
                    user: true, // Загружаем связанного пользователя с email
                },
            }
        )
        return foundedUser;
    }
    async updateUserPassword(
        email: string,
        passwordHash: string
    ): Promise<boolean> {
        const updateUser = await this.prisma.user.updateMany({
            where: { email: email },
            data: {
                passwordHash,
            },
        })
        return updateUser.count ? updateUser.count >= 0 : false
    }

    async addTokenInBlackList(token: string) {
        const addedToken = await this.prisma.tokensBlackList.create({
            data: {
                token,
            },
        })

        return addedToken.id ? true : null
    }

    async findTokenInBlackList(token: string) {
        const isTokenInBlackList = await this.prisma.tokensBlackList.findFirst({
            where: { token },
        })

        return isTokenInBlackList ? isTokenInBlackList.token : null
    }

    async createOrUpdateRefreshToken(
        refreshTokenInfo: DeviceDBModel
    ): Promise<boolean> {
        const foundUserDevices = await this.prisma.device.findFirst({
            where: {
                userId: refreshTokenInfo.userId,
                deviceId: refreshTokenInfo.deviceId,
            },
        })
        if (foundUserDevices) {
            const updatedDevice = await this.prisma.device.updateMany({
                where: {
                    userId: refreshTokenInfo.userId,
                    deviceId: refreshTokenInfo.deviceId,
                },
                data: {
                    issuedAt: refreshTokenInfo.issuedAt,
                    expirationAt: refreshTokenInfo.expirationAt,
                    ip: refreshTokenInfo.ip,
                    deviceName: refreshTokenInfo.deviceName,
                },
            })
            return updatedDevice.count ? updatedDevice.count >= 1 : false
        }
        try {
            const createdDevice = await this.prisma.device.create({
                data: {
                    userId: refreshTokenInfo.userId,
                    deviceId: refreshTokenInfo.deviceId,
                    issuedAt: refreshTokenInfo.issuedAt,
                    expirationAt: refreshTokenInfo.expirationAt,
                    ip: refreshTokenInfo.ip,
                    deviceName: refreshTokenInfo.deviceName,
                },
            })
            return !!createdDevice.id
        } catch (e) {
            return false
        }
    }
}
