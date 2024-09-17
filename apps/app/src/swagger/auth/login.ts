import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ResponseAccessTokenViewDTO } from '../../modules/auth/api/dto/ResponseAccessTokenViewDTO'

export function Login() {
    return applyDecorators(
        ApiOperation({
            summary: 'login user',
            requestBody: {
                content: {
                    'text/plain': {
                        schema: {
                            example: {
                                loginOrEmail: 'string',
                                password: 'string',
                            },
                        },
                    },
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.OK,
            description: 'success login  user',
            type: ResponseAccessTokenViewDTO,
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description: 'incorrect values',
        }),
        ApiResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'login or password is incorrect',
        })
    )
}
