import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { UpdateProfileTpeDTOSwagger } from './types'

export function UpdateProfileEndpoint() {
    return applyDecorators(
        ApiOperation({ summary: 'update profile' }),
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
