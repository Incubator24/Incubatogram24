import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'

export function UpdateAvatarEndpoint() {
    return applyDecorators(
        ApiTags('profile'),
        ApiOperation({ summary: 'Load PNG or JPG image' }),
        ApiBearerAuth('JWT-auth'),
        ApiConsumes('multipart/form-data'),
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    file: {
                        type: 'string',
                        format: 'binary', // Описание файла для загрузки
                        description: 'JPEG or PNG image file',
                    },
                },
                required: ['file'], // Указание, что файл обязателен
            },
        }),
        ApiResponse({
            status: HttpStatus.CREATED,
            description: 'success updated avatar',
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description: 'error on update avatar',
        })
    )
}
