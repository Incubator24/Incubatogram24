import { ApiProperty } from '@nestjs/swagger'

export class LoginSuccessViewModel {
    @ApiProperty({ example: 'string', description: 'JWT access token' })
    accessToken: string
}
