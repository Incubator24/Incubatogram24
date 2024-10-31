import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString, Length} from "class-validator";


export class EmailResendingDto {
    @ApiProperty({
        example: 'ivan777@gmail.com',
        description: 'email dto',
    })
    @IsNotEmpty()
    @IsString()
    @Length(1)
    email: string
}