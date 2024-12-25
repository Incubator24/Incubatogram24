import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { ProfileTypeDTOSwagger } from './types'

export function CreateProfileEndpoint() {
    return applyDecorators(
        ApiTags('profile'),
        ApiOperation({ summary: 'Create new profile' }),
        ApiBearerAuth('JWT-auth'),
        ApiResponse({
            status: HttpStatus.CREATED,
            description: 'create profile',
            type: ProfileTypeDTOSwagger,
        }),
        ApiResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'Unauthorized',
        })
    )
}
