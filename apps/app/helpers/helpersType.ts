import {
    BadRequestException,
    ForbiddenException,
    HttpStatus,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common'

export type ResultObject<T> = {
    data: T | null
    resultCode: HttpStatus
    message?: string
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
