import { DeviceDBModel, DeviceViewModel } from './device.types'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../../prisma/prisma.service'

@Injectable()
export class DeviceQueryRepositorySql {
    constructor(private prisma: PrismaService) {}

    async getAllDeviceSessions(userId: number): Promise<DeviceViewModel[]> {
        const sessions = await this.prisma.device.findMany({
            where: {
                userId: userId,
                issuedAt: {
                    not: 0,
                },
            },
        })

        return sessions.map((session) => this.getSessionsMapping(session))
    }

    async findUserIdByDeviceId(deviceId: string): Promise<number | null> {
        const foundUser = await this.prisma.device.findFirst({
            where: {
                deviceId: deviceId,
            },
        })

        return foundUser ? foundUser.userId : null
    }

    async findSessionByDeviceIdAndUserId(
        deviceId: string,
        userId: number
    ): Promise<number | null> {
        const foundDeviceInfo = await this.prisma.device.findFirst({
            where: {
                userId,
                deviceId,
            },
        })
        if (foundDeviceInfo) {
            return foundDeviceInfo.userId
        }
        return null
    }

    private getSessionsMapping(device: DeviceDBModel): DeviceViewModel {
        return {
            ip: device.ip,
            title: device.deviceName,
            lastActiveDate: new Date(Number(device.issuedAt)).toISOString(),
            deviceId: device.deviceId,
        }
    }
}
