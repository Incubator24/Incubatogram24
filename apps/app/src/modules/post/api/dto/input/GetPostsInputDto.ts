import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'
import { Transform } from 'class-transformer'

export class GetPostsInputDto {
    @ApiProperty()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    page: number
}
