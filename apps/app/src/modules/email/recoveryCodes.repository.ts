import { PrismaService } from '../../../../../prisma/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class RecoveryCodesRepository {
    constructor(private prisma: PrismaService) {}

    // async createDataForRecoveryCode(
    //     email: string,
    //     code: string
    // ): Promise<string | boolean> {
    //     await this.prisma.recoveryCodes.create({
    //         data: {
    //             recoveryCode: code,
    //             email: email,
    //         },
    //     })
    //     const newInfoAboutRecoveryCode = await this.findDataByRecoveryCode(code)
    //     if (newInfoAboutRecoveryCode.recoveryCode !== code) {
    //         return false
    //     }
    //     return newInfoAboutRecoveryCode.recoveryCode
    // }

    // async updateDataForRecoveryCode(
    //     email: string,
    //     code: string
    // ): Promise<string | boolean> {
    //     await this.prisma.passwordRecovery.updateMany({
    //         data: {
    //             recoveryCode: code,
    //         },
    //         where: { email: email },
    //     })
    //
    //     const newInfoAboutRecoveryCode = await this.findDataByRecoveryCode(code)
    //     if (newInfoAboutRecoveryCode.email !== email) {
    //         return false
    //     }
    //     return newInfoAboutRecoveryCode.recoveryCode
    // }

    async findDataByRecoveryCode(code: string): Promise<any | null> {
        const userData = await this.prisma.passwordRecovery.findFirst({
            where: {
                recoveryCode: code,
            },
        })

        return userData ? userData : null
    }
}
