import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

export function RegistrationEndpoint() {
    return applyDecorators(
        ApiTags('auth'),
        ApiOperation({
            summary:
                'Registration in the system. Email with confirmation code will be send to passed email address',
        }),
        ApiResponse({
            status: HttpStatus.NO_CONTENT,
            description:
                'Input data is accepted. Email with confirmation code will be send to passed email address',
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description:
                'If the inputModel has incorrect values (in particular if the user with the given email or login already exists)',
        })
    )
}
