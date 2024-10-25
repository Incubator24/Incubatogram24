import { Injectable } from '@nestjs/common'
import { IRecoveryCodesRepository } from '../interfaces/recoveryCodes.repository.interface'
import { PasswordRecovery } from '@prisma/client'
import { PrismaService } from '../../../../../prisma/prisma.service'

@Injectable()
export class RecoveryCodesRepository implements IRecoveryCodesRepository {
    constructor(private prisma: PrismaService) {}

    async createDataForRecoveryCode(
        email: string,
        code: string
    ): Promise<string | boolean> {
        // await this.prisma.recoveryCodes.create({
        //     data: {
        //         recoveryCode: code,
        //         email: email,
        //     },
        // })
        // const newInfoAboutRecoveryCode = await this.findDataByRecoveryCode(code)
        // if (newInfoAboutRecoveryCode.recoveryCode !== code) {
        //     return false
        // }
        // return newInfoAboutRecoveryCode.recoveryCode
        return
    }

    async updateDataForRecoveryCode(
        email: string,
        code: string
    ): Promise<string | boolean> {
        // await this.prisma.passwordRecovery.updateMany({
        //     data: {
        //         recoveryCode: code,
        //     },
        //     where: { email: email },
        // })
        //
        // const newInfoAboutRecoveryCode = await this.findDataByRecoveryCode(code)
        // if (newInfoAboutRecoveryCode.email !== email) {
        //     return false
        // }
        // return newInfoAboutRecoveryCode.recoveryCode
        return
    }

    async findDataByRecoveryCode(
        code: string
    ): Promise<PasswordRecovery | null> {
        return this.prisma.passwordRecovery.findFirst({
            where: {
                recoveryCode: code,
            },
        })
    }
}
