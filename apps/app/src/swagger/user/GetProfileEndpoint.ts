import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { UserTypeDTOSwagger } from './types'

export function GetProfileEndpoint() {
    return applyDecorators(
        ApiOperation({ summary: 'get profile' }),
        ApiResponse({
            status: HttpStatus.OK,
            description: 'Success',
            type: UserTypeDTOSwagger,
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
