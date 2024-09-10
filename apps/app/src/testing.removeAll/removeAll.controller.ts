import { Controller, Delete, HttpCode } from '@nestjs/common'
import { UserRepository } from '../user/user.repository'
import { DeviceRepository } from '../devices/device.repository'
import { RemoveAllDataEndpoint } from './swagger/RemoveAllData'

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
        await this.deviceRepositorySql.deleteAllDevices()
        await this.userRepository.deleteAllUsers()
    }
}
