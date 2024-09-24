import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ProfileTpeDTOSwagger } from '../user/types'

export function GetAllUsersEndpoint() {
    return applyDecorators(
        ApiTags('admin'),
        ApiOperation({ summary: 'Get all users' }),
        ApiResponse({
            status: HttpStatus.OK,
            description: 'get all users',
            type: ProfileTpeDTOSwagger,
        })
    )
}
