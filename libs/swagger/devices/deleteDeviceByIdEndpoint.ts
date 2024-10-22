import { ApiTags } from '@nestjs/swagger'
import { applyDecorators } from '@nestjs/common'

export function DeleteDeviceByIdEndpoint() {
    return applyDecorators(ApiTags('devices'))
}
