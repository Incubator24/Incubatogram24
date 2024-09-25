import { ApiProperty } from '@nestjs/swagger'
import {
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
    Matches,
    MaxLength,
} from 'class-validator'

export class CreateProfileDto {
    @ApiProperty({
        example: 'Ivan_777',
        description:
            'The login of the user, must be unique and consist of allowed characters (0-9, A-Z, a-z, _, -)',
        minLength: 6,
        maxLength: 30,
        pattern: `^[a-zA-Z0-9_-]*$`,
    })
    @IsOptional()
    @IsString()
    @Length(6, 30)
    @Matches('/^[a-z]+$|^[A-Za-z0-9_-]+$|^[a-z0-9_-]+$/')
    userName: string

    @ApiProperty({
        example: 'Ivan',
        description: 'The first name of the user.',
        minLength: 1,
        maxLength: 50,
    })
    @IsNotEmpty()
    @IsString()
    @Length(1, 50)
    @Matches(`^[a-zA-Z]*$`)
    firstName: string

    @ApiProperty({
        example: 'Ivanov',
        description: 'The last name of the user.',
        minLength: 1,
        maxLength: 50,
    })
    @IsNotEmpty()
    @IsString()
    @Length(1, 50)
    @Matches(`^[a-zA-Z]*$`)
    lastName: string

    @ApiProperty({
        example: '01-01-1990',
        description: 'The date of birth of the user in DD-MM-YYYY format.',
    })
    @IsString()
    dateOfBirth: string

    @ApiProperty({
        example: 'Moscow',
        description: 'The city where the user resides.',
    })
    @IsString()
    @IsOptional()
    city: string

    @ApiProperty({
        example: 'I am a software developer.',
        description: 'A brief description about the user.',
        maxLength: 200,
    })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    aboutMe: string
}
