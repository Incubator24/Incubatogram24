import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { Trim } from '../../../../helpers/decorators/transform/trim'

export class AuthInputModel {
    @ApiProperty({
        description: 'loginOrEmail',
        example: 'string',
    })
    @Trim()
    @IsString()
    @IsNotEmpty()
    loginOrEmail: string

    @ApiProperty({
        description: 'password',
        example: 'string',
    })
    @Trim()
    @IsString()
    @IsNotEmpty()
    password: string
}
