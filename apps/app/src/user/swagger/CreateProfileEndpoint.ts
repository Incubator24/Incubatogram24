import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { ProfileTpeDTOSwagger } from './types'

export function CreateProfileEndpoint() {
    return applyDecorators(
        ApiOperation({ summary: 'create profile' }),
        ApiBearerAuth('JWT-auth'),
        ApiResponse({
            status: HttpStatus.CREATED,
            description: 'create profile',
            type: ProfileTpeDTOSwagger,
        }),
        ApiResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'Unauthorized',
        })
    )
}
