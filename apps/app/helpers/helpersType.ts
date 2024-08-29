import {
    BadRequestException,
    ForbiddenException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import Configuration from '../src/config/configuration'

export class ResultObject<T> {
    @ApiProperty({
        description: 'The data returned by the operation',
        nullable: true,
        example: 'example data',
    })
    data: T | null

    @ApiProperty({
        description: 'The HTTP status code of the result',
        enum: HttpStatus,
        example: HttpStatus.OK,
    })
    resultCode: HttpStatus

    @ApiProperty({
        description: 'An optional message providing additional information',
        required: false,
        example: 'Operation completed successfully',
    })
    message?: string

    @ApiProperty({
        description: 'An optional field indicating which field caused an error',
        required: false,
        example: 'username',
    })
    field?: string
}

export const mappingBadRequest = (errorMessage: string, field: string) => {
    throw new BadRequestException({
        message: [{ message: errorMessage, field: field }],
    })
}
export const mappingErrorStatus = (resultObject: ResultObject<any>) => {
    const statusCode = resultObject.resultCode
    const textError = resultObject.message || 'no message'
    const field = resultObject.field || 'some field'
    switch (statusCode) {
        case HttpStatus.BAD_REQUEST:
            throw new BadRequestException({
                message: [{ message: textError, field: field }],
            })
        case HttpStatus.UNAUTHORIZED:
            throw new UnauthorizedException({
                message: [{ message: textError, field: field }],
            })
        case HttpStatus.FORBIDDEN:
            throw new ForbiddenException({
                message: [{ message: textError, field: field }],
            })
        case HttpStatus.NOT_FOUND:
            throw new NotFoundException({
                message: [{ message: textError, field: field }],
            })
        case HttpStatus.INTERNAL_SERVER_ERROR:
            throw new InternalServerErrorException({
                message: [{ message: textError, field: field }],
            })
        default:
            throw new InternalServerErrorException()
    }
}

@Injectable()
export class RecaptchaAdapter {
    constructor() {}

    async isValid(value) {
        try {
            const response = await fetch(
                'https://www.google.com/recaptcha/api/siteverify',
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    method: 'POST',
                    body: `secret=${Configuration.getConfiguration().RECAPTCHA_PRIVATE_KEY}&response=${value}`,
                }
            )

            const data: RecaptchaResponse = await response.json()

            if (!data || !data.success) {
                return false
            }

            return data.success
        } catch (error) {
            console.error('Error validating reCAPTCHA:', error)
            return false
        }
    }
}

type RecaptchaResponse = {
    success: true | false
    challenge_ts: string
    hostname: string
    'error-codes': any[]
}
