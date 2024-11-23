import { Controller, Delete, HttpCode } from '@nestjs/common'
import { UserRepository } from '../user/infrastructure/repositories/user.repository'
import { DeviceRepository } from '../devices/device.repository'
import { ApiExcludeEndpoint } from '@nestjs/swagger'

@Controller('testing/all-data')
export class TestingRemoveAll {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly deviceRepositorySql: DeviceRepository
    ) {}

    @HttpCode(204)
    @Delete()
    @ApiExcludeEndpoint()
    async removeAllData() {
        await this.userRepository.deleteAllProfile()
        await this.userRepository.deleteAllEmailData()
        await this.userRepository.deletePassRecovery()
        await this.deviceRepositorySql.deleteAllDevices()
        await this.userRepository.deleteAllUsers()
    }
}
