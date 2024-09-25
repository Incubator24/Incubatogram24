import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'

export function DeleteAvatarEndpoint() {
    return applyDecorators(
        ApiTags('profile'),
        ApiOperation({ summary: 'Delete avatar' }),
        ApiBearerAuth('JWT-auth'),
        ApiResponse({
            status: HttpStatus.NO_CONTENT,
            description: 'No Content',
        })
    )
}
