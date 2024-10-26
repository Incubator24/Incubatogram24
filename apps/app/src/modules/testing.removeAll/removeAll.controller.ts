import { Controller, Delete, HttpCode } from '@nestjs/common'
import { UserRepository } from '../user/infrastructure/repositories/user.repository'
import { DeviceRepository } from '../devices/device.repository'
import { RemoveAllDataEndpoint } from '../../../../../libs/swagger/superAdmin/RemoveAllData'

@Controller('testing/all-data')
export class TestingRemoveAll {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly deviceRepositorySql: DeviceRepository
    ) {}

    @HttpCode(204)
    @Delete()
    @RemoveAllDataEndpoint()
    async removeAllData() {
        await this.userRepository.deleteAllProfile()
        await this.userRepository.deleteAllEmailData()
        await this.userRepository.deletePassRecovery()
        await this.deviceRepositorySql.deleteAllDevices()
        await this.userRepository.deleteAllUsers()
    }
}
