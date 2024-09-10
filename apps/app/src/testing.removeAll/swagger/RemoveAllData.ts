import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

export function RemoveAllDataEndpoint() {
    return applyDecorators(
        ApiTags('Testing'),
        ApiOperation({
            summary:
                'Clear database: delete all data from all tables/collections',
        }),
        ApiResponse({
            status: HttpStatus.NO_CONTENT,
            description: 'All data is deleted',
        })
    )
}
