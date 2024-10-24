import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { Trim } from '../../../../../../../../libs/helpers/decorators/transform/trim'

export class UpdatePostInputDto {
    @ApiProperty()
    @Trim()
    @IsString()
    @IsNotEmpty()
    description: string
}
