import { Module } from '@nestjs/common'
import { TestingRemoveAll } from './removeAll.controller'
import { UserRepository } from '../user/user.repository'
import { PrismaService } from '../../../../prisma/prisma.service'
import { DeviceRepository } from '../devices/device.repository'

@Module({
    imports: [],
    controllers: [TestingRemoveAll],
    providers: [UserRepository, DeviceRepository, PrismaService],
})
export class RemoveAllModule {}
