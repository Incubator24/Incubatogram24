import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { AuthService } from '../auth.service'
import { HttpStatus, Injectable } from '@nestjs/common'
import { CreateUserDto } from '../../api/dto/CreateUserDto'
import * as bcrypt from 'bcryptjs'
import { IUserRepository } from '../../../../app/src/modules/user/infrastructure/interfaces/user.repository.interface'
import { EmailService } from '../../../../app/src/modules/email/email.service'
import { ResultObject } from '../../../../../libs/helpers/types/helpersType'
import Configuration from '../../../../../libs/config/configuration'
import {
    CreatedEmailDto,
    CreatedUserDto,
} from '../../../../../libs/helpers/types/types'
import { PasswordRecoveryDto } from '../../../../../libs/helpers/types/passwordRecoveryDto'
import {
    createEmailDto,
    createPassDto,
} from '../../../../../libs/helpers/functions'

@Injectable()
export class CreateUserByRegistrationCommand {
    constructor(public registrationDto: CreateUserDto) {}
}

@CommandHandler(CreateUserByRegistrationCommand)
export class CreateUserByRegistration
    implements ICommandHandler<CreateUserByRegistrationCommand>
{
    constructor(
        public authService: AuthService,
        public userRepository: IUserRepository,
        public emailService: EmailService
    ) {}

    async execute(
        command: CreateUserByRegistrationCommand
    ): Promise<ResultObject<number>> {
        const foundUser =
            await this.userRepository.findUserByLoginOrEmailWithEmailInfo(
                command.registrationDto.userName,
                command.registrationDto.email
            )
        if (foundUser) {
            if (foundUser) {
                return {
                    resultCode: HttpStatus.BAD_REQUEST,
                    field: 'email and username',
                    message:
                        'User with this email and username is already registered',
                    data: null,
                }
            } else {
                await this.userRepository.deleteUserByUserId(foundUser.id)
            }
        }
        const [isUserNameExist, isEmailExist] = await Promise.all([
            this.userRepository.findUserByLoginOrEmail(
                command.registrationDto.userName
            ),
            this.userRepository.findUserByLoginOrEmail(
                command.registrationDto.email
            ),
        ])

        if (isUserNameExist && isEmailExist) {
            return {
                resultCode: HttpStatus.BAD_REQUEST,
                field: 'email and username',
                message:
                    'User with this email and username is already registered',
                data: null,
            }
        }

        if (isUserNameExist) {
            return {
                resultCode: HttpStatus.BAD_REQUEST,
                field: 'username',
                message: ' User with this username is already registered',
                data: null,
            }
        }

        if (isEmailExist) {
            return {
                resultCode: HttpStatus.BAD_REQUEST,
                field: 'email',
                message: ' User with this email is already registered',
                data: null,
            }
        }

        const passwordSaltNumber =
            Configuration.getConfiguration().PASSWORD_SALT
        const passwordSalt = await bcrypt.genSalt(Number(passwordSaltNumber))
        const passwordHash = await this.authService._generateHash(
            command.registrationDto.password,
            passwordSalt
        )
        const createdAt = new Date().toISOString()
        const createdUserDataDto: CreatedUserDto = {
            userName: command.registrationDto.userName,
            email: command.registrationDto.email,
            passwordHash,
            passwordSalt,
            createdAt: createdAt,
            updatedAt: createdAt,
            isDeleted: false,
        }
        const createdUserId: number =
            await this.userRepository.createUser(createdUserDataDto)
        // получаем userId
        if (!createdUserId) {
            console.log('Failed to create user')

            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                message: 'couldn`t create user',
            }
        }
        // создаем объект для восстановления пароля
        const passRecoveryDto: PasswordRecoveryDto = createPassDto()
        await this.userRepository.createRecoveryCode(
            passRecoveryDto,
            createdUserId
        )
        // создаем объект для отправки кода на мыло
        const emailConfirmationInfo: CreatedEmailDto = createEmailDto(false)

        const createdEmailConfirmationCode =
            await this.userRepository.createEmailExpiration(
                emailConfirmationInfo,
                createdUserId
            )
        if (!createdEmailConfirmationCode) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                message: 'couldn`t create email confirmation',
            }
        }
        try {
            await this.emailService.sendConfirmationEmail(
                createdEmailConfirmationCode,
                createdUserDataDto.email
            )
        } catch (e) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                message: 'couldn`t send email' + e.message,
            }
        }

        return {
            data: createdUserId,
            resultCode: HttpStatus.NO_CONTENT,
        }
    }
}
