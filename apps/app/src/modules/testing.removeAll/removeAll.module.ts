import { Module } from '@nestjs/common'
import { TestingRemoveAll } from './removeAll.controller'
import { PrismaService } from '../../../../../prisma/prisma.service'
import { DeviceRepository } from '../devices/device.repository'
import { UserRepository } from '../user/infrastructure/repositories/user.repository'

@Module({
    imports: [],
    controllers: [TestingRemoveAll],
    providers: [UserRepository, DeviceRepository, PrismaService],
})
export class RemoveAllModule {}
