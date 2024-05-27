import { PrismaService } from '../../../../prisma/prisma.service'

export class DeviceRepositorySql {
    constructor(private prisma: PrismaService) {}

    async deleteOtherUserDevice(
        userId: number,
        currentDeviceId: string
    ): Promise<boolean> {
        const findAllSessions = await this.prisma.device.findMany({
            where: {
                userId: userId,
            },
        })

        if (
            findAllSessions.length === 1 &&
            findAllSessions[0].deviceId === currentDeviceId
        ) {
            return true
        }

        const deletedOtherSessions = await this.prisma.device.deleteMany({
            where: {
                userId: userId,
                deviceId: {
                    not: currentDeviceId,
                },
            },
        })

        return deletedOtherSessions.count
            ? deletedOtherSessions.count >= 1
            : false
    }

    async deleteUserDeviceById(deviceId: string): Promise<boolean> {
        // const deletedOtherSession = await this.dataSource.query(
        //   `
        //   DELETE FROM public."Devices"
        //   WHERE "deviceId" = $1
        // `,
        //   [deviceId],
        // );

        const deletedOtherSession = await this.prisma.device.deleteMany({
            where: {
                deviceId: deviceId,
            },
        })
        return deletedOtherSession.count
            ? deletedOtherSession.count >= 1
            : false
    }

    async deleteCurrentUserDevice(
        userId: number,
        currentDeviceId: string
    ): Promise<boolean> {
        // const deletedUserSession = await this.dataSource.query(
        //   `
        //   DELETE FROM public."Devices"
        //   WHERE "userId" = $1 and "deviceId" = $2
        // `,
        //   [userId, currentDeviceId],
        // );
        const deletedUserSession = await this.prisma.device.deleteMany({
            where: { userId, deviceId: currentDeviceId },
        })
        return deletedUserSession.count ? deletedUserSession.count >= 0 : false
    }
}
