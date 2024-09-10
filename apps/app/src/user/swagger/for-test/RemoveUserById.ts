import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

export function RemoveUserByIdEndpoint() {
    return applyDecorators(
        ApiTags('Testing'),
        ApiOperation({ summary: 'Delete user by id' }),
        ApiResponse({
            status: HttpStatus.OK,
        })
    )
}
