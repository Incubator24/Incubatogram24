import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'

export function UpdateProfileEndpoint() {
    return applyDecorators(
        ApiTags('profile'),
        ApiOperation({ summary: 'Update current profile' }),
        ApiBearerAuth('JWT-auth'),
        ApiResponse({
            status: HttpStatus.NO_CONTENT,
            description: 'No Content',
        }),
        ApiResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'Unauthorized',
        })
    )
}
