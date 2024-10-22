import { ApiTags } from '@nestjs/swagger'
import { applyDecorators } from '@nestjs/common'

export function GetDeviceEndpoint() {
    return applyDecorators(ApiTags('devices'))
}
