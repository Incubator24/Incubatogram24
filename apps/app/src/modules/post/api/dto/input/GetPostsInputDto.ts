import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'
import { Transform } from 'class-transformer'

export class GetPostsInputDto {
    @ApiPropertyOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    page: number = 1
}
