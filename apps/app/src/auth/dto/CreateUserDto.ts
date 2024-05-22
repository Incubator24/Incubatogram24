import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @Length(3, 10)
    //    @Matches('^[a-zA-Z0-9_-]*$')
    login: string

    @IsNotEmpty()
    @IsString()
    @Length(6, 20)
    password: string

    @IsNotEmpty()
    @IsString()
    //  @Validate(EmailExistsRule)
    // @Matches('^[w-.]+@([w-]+.)+[w-]{2,4}$')
    @IsEmail()
    email: string
}
