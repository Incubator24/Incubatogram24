import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'

export function GetAvatarEndpoint() {
    return applyDecorators(
        ApiTags('profile'),
        ApiOperation({ summary: 'get avatar' }),
        ApiBearerAuth('JWT-auth')
    )
}
