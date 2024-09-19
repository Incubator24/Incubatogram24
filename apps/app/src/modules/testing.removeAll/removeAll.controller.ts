import { Controller, Delete, HttpCode } from '@nestjs/common'
import { RemoveAllDataEndpoint } from '../../swagger/testing-all-data/RemoveAllData'
import { UserRepository } from '../user/infrastructure/repositories/user.repository'
import { DeviceRepository } from '../devices/device.repository'

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
