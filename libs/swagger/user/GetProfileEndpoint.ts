import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ProfileTypeDTOSwagger } from './types'

export function GetProfileEndpoint() {
    return applyDecorators(
        ApiTags('profile'),
        ApiOperation({ summary: 'Get profile' }),
        ApiResponse({
            status: HttpStatus.OK,
            description: 'Success',
            type: ProfileTypeDTOSwagger,
        }),
        ApiResponse({
            status: HttpStatus.NOT_FOUND,
            description: 'if profile not found',
        }),
        ApiResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'Unauthorized',
        })
    )
}
