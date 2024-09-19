import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDto {
    @ApiProperty({
        example: 'ivan777',
        description: 'The login of the user, must be unique',
        minLength: 6,
        maxLength: 30,
        pattern: `^[a-zA-Z0-9_-]*$`,
    })
    @IsNotEmpty()
    @IsString()
    @Length(6, 30)
    //    @Matches('^[a-zA-Z0-9_-]*$')
    userName: string

    @ApiProperty({
        example: '7777777lol',
        description: 'The password of the user',
        minLength: 6,
        maxLength: 20,
    })
    @IsNotEmpty()
    @IsString()
    @Length(6, 20)
    password: string

    @ApiProperty({
        example: 'ivan777@mail.ru',
        description: 'The email of the user',
        pattern: `^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$`,
    })
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string
}
