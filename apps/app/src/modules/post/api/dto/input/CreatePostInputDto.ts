import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'
import { Trim } from '../../../../../helpers/decorators/transform/trim'
import { Transform } from 'class-transformer'

export class CreatePostInputDto {
    @ApiProperty()
    @Trim()
    @IsString()
    @IsNotEmpty()
    description: string

    @ApiProperty({
        description: 'is draft flag',
        example: false,
    })
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    @IsNotEmpty()
    isDraft: boolean
}
