import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name)

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()

        const status =
            exception instanceof HttpException ? exception.getStatus() : 500
        this.logger.error(`Status: ${status} Error: ${exception.message}`)

        if (status === 500) {
            if (process.env.envoriment !== 'production') {
                response.status(500).send({
                    error: exception.toString(),
                    stack: exception.stack,
                })
            } else {
                response.status(500).send('some error ocurred')
            }
        }

        if (status === 400) {
            const errorResponse: any = {
                errorsMessages: [],
            }

            // const responseBody: any = exception.getResponse()
            //
            // responseBody.message.forEach((m) =>
            //     errorResponse.errorsMessages.push(m)
            // )
            // response.status(status).json(errorResponse)

            const responseBody: any = exception.getResponse()

            // Проверяем, является ли message массивом
            if (Array.isArray(responseBody.message)) {
                responseBody.message.forEach((m) =>
                    errorResponse.errorsMessages.push(m)
                )
            } else if (typeof responseBody.message === 'string') {
                // Если message - строка, добавляем её в массив
                errorResponse.errorsMessages.push(responseBody.message)
            }

            response.status(status).json(errorResponse)
        } else if (status === 404) {
            const errorResponse: any = {
                errorsMessages: [],
            }

            // const responseBody: any = exception.getResponse()
            //
            // responseBody.message.forEach((m) =>
            //     errorResponse.errorsMessages.push(m)
            // )
            // response.status(status).json(errorResponse)

            const responseBody: any = exception.getResponse()

            // Проверяем, является ли message массивом
            if (Array.isArray(responseBody.message)) {
                responseBody.message.forEach((m) =>
                    errorResponse.errorsMessages.push(m)
                )
            } else if (typeof responseBody.message === 'string') {
                // Если message - строка, добавляем её в массив
                errorResponse.errorsMessages.push(responseBody.message)
            }

            response.status(status).json(errorResponse)
        } else {
            response.status(status).json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
            })
        }
    }
}
