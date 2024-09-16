import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { UserInfoDTO } from '../dto/UserInfoDto'

export function GetMeEndpoint() {
    return applyDecorators(
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
