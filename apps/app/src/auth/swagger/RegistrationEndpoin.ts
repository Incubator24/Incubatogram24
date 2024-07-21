import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

export function RegistrationEndpoint() {
    return applyDecorators(
        ApiOperation({ summary: 'registration user' }),
        ApiResponse({
            status: HttpStatus.CREATED,
            description: 'success registration  user',
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description: 'error on registration user',
        })
    )
}
