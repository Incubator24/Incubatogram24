import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Length,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Injectable } from '@nestjs/common'
import { UserRepository } from '../../user/user.repository'

@ValidatorConstraint({ name: 'EmailExists', async: true })
@Injectable()
export class EmailExistsRule implements ValidatorConstraintInterface {
    constructor(public userRepository: UserRepository) {}

    async validate(value: string) {
        const result = await this.userRepository.findUserByLoginOrEmail(value)
        return !result
    }

    defaultMessage() {
        return 'Email  exist'
    }
}

@ValidatorConstraint({ name: 'LoginExists', async: true })
@Injectable()
export class LoginExistsRule implements ValidatorConstraintInterface {
    constructor(public userRepository: UserRepository) {}

    async validate(value: string) {
        const result = await this.userRepository.findUserByLoginOrEmail(value)
        return !result
    }

    defaultMessage() {
        return 'Login  exist'
    }
}

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
    //  @Validate(LoginExistsRule)
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
    //  @Validate(EmailExistsRule)
    @IsEmail()
    email: string
}
