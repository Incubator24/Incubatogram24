import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { ProfileTypeDTOSwagger } from './types'

export function GetMyProfileEndpoint() {
    return applyDecorators(
        ApiTags('profile'),
        ApiOperation({ summary: 'Get my profile' }),
        ApiBearerAuth('JWT-auth'),
        ApiResponse({
            status: HttpStatus.OK,
            description: 'Success',
            type: ProfileTypeDTOSwagger,
        }),
        ApiResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'login or password is incorrect',
        })
    )
}
