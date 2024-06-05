import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { DeviceRepositorySql } from '../../device.repository.sql'
import { Injectable } from '@nestjs/common'

@Injectable()
export class DeleteOtherUserDeviceCommand {
    constructor(
        public userId: number,
        public deviceId: string
    ) {}
}

@CommandHandler(DeleteOtherUserDeviceCommand)
export class DeleteOtherUserDevice
    implements ICommandHandler<DeleteOtherUserDeviceCommand>
{
    constructor(public deviceRepository: DeviceRepositorySql) {}

    async execute(command: DeleteOtherUserDeviceCommand): Promise<boolean> {
        return await this.deviceRepository.deleteOtherUserDevice(
            command.userId,
            command.deviceId
        )
    }
}
