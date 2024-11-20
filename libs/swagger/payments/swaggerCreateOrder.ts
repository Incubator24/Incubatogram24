import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'

export function SwaggerCreateOrder() {
    return applyDecorators(
        ApiBearerAuth('JWT-auth'),
        ApiOperation({
            summary: 'Buy premium',
            requestBody: {
                content: {
                    'text/plain': {
                        schema: {
                            example: {
                                paymentSystem: 'stripe',
                                subscriptionType: '1 day',
                                quantity: '10',
                            },
                        },
                    },
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.UNAUTHORIZED,
            description: 'Unauthorized',
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description: 'If something in body is invalid',
            schema: {
                example: {
                    errorsMessages: [
                        {
                            message: 'string',
                            field: 'string',
                        },
                    ],
                },
            },
        })
    )
}
