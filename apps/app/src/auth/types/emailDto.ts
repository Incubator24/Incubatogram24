import { IsNotEmpty, IsString, Length } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class emailDto {
    @ApiProperty({
        example: 'ivan777@gmail.com',
        description: 'email dto',
    })
    @IsNotEmpty()
    @IsString()
    @Length(1)
    email: string
}
