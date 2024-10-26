import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { UserTypeDTOSwagger } from '../user/types'

export function Me() {
    return applyDecorators(
        ApiTags('auth'),

        ApiOperation({
            summary: 'Get information about current user',
        }),
        ApiBearerAuth('JWT-auth'),
        ApiResponse({
            status: HttpStatus.OK,
            description: 'Success',
            type: UserTypeDTOSwagger,
        }),
        ApiResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'login or password is incorrect',
        })
    )
}
