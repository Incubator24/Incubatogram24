import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { UpdateProfileTpeDTOSwagger } from './types'

export function UpdateProfileEndpoint() {
    return applyDecorators(
        ApiOperation({ summary: 'update profile' }),
        ApiBearerAuth('JWT-auth'),
        ApiResponse({
            status: HttpStatus.NO_CONTENT,
            description: 'create profile',
            type: UpdateProfileTpeDTOSwagger,
        }),
        ApiResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'Unauthorized',
        })
    )
}
