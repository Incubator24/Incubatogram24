import { IsNotEmpty, IsString, Length } from 'class-validator'

export class emailDto {
    @IsNotEmpty()
    @IsString()
    @Length(1)
    email: string
}
