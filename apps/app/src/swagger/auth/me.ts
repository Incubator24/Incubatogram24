import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { UserInfoDTO } from '../../modules/auth/api/dto/UserInfoDto'

export function Me() {
    return applyDecorators(
        ApiTags('auth'),

        ApiOperation({
            summary: 'Get information about current user',
        }),
        ApiResponse({
            status: HttpStatus.OK,
            description: 'Success',
            type: UserInfoDTO,
        }),
        ApiResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'login or password is incorrect',
        })
    )
}
