import { ApiTags } from '@nestjs/swagger'
import { applyDecorators } from '@nestjs/common'

export function DeleteDeviceEndpoint() {
    return applyDecorators(ApiTags('devices'))
}
