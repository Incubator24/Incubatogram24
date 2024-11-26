import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

export function GithubEndpoint() {
    return applyDecorators(
        ApiTags('auth'),
        ApiOperation({
            summary: 'Registration from Github',
        }),
        ApiResponse({
            status: HttpStatus.OK,
            description:
                'Returns JWT accessToken in body and JWT refreshToken in cookie',
            schema: { example: { accessToken: 'string' } },
        }),
        ApiResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'If the password or login is wrong',
        })
    )
}
