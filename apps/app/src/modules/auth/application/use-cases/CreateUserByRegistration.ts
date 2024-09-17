import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { AuthService } from '../auth.service'
import { HttpStatus, Injectable } from '@nestjs/common'
import { CreateUserDto } from '../../api/dto/CreateUserDto'
import { Prisma } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { add } from 'date-fns'
import * as bcrypt from 'bcryptjs'
import { EmailService } from '../../../email/email.service'
import { ResultObject } from '../../../../helpers/helpersType'
import Configuration from '../../../../config/configuration'
import { emailConfirmationType } from '../../../email/emailConfirmationType'
import { IUserRepository } from '../../../user/infrastructure/interfaces/user.repository.interface'

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
        // ищем юзера
        const foundUser =
            await this.userRepository.findUserByLoginOrEmailWithEmailInfo(
                command.registrationDto.userName,
                command.registrationDto.email
            )
        console.log('foundUser = ', foundUser)
        if (foundUser) {
            if (
                foundUser.emailConfirmationUser &&
                foundUser.emailConfirmationUser[0].isConfirmed
            ) {
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
        console.log('asd')
        const [isUserNameExist, isEmailExist] = await Promise.all([
            this.userRepository.findUserByLoginOrEmail(
                command.registrationDto.userName
            ),
            this.userRepository.findUserByLoginOrEmail(
                command.registrationDto.email
            ),
        ])
        console.log('foundUserName or email = ', isUserNameExist)

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
        const dataForUser: Prisma.UserCreateInput = {
            email: command.registrationDto.email,
            userName: command.registrationDto.userName,
            passwordSalt,
            passwordHash,
        }
        const createdUserId: number =
            await this.userRepository.createUser(dataForUser)

        if (!createdUserId) {
            console.log('Failed to create user')

            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                message: 'couldn`t create user',
            }
        }
        const emailConfirmationInfo: emailConfirmationType = {
            userId: createdUserId!,
            confirmationCode: uuidv4(),
            emailExpiration: add(new Date(), {
                hours: 24,
                minutes: 3,
            }).toISOString(),
            isConfirmed: false,
        }

        const createdEmailConfirmation =
            await this.userRepository.sendEmailConfirmation(
                emailConfirmationInfo
            )
        console.log(createdEmailConfirmation)
        if (!createdEmailConfirmation) {
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                message: 'couldn`t create email confirmation',
            }
        }

        const createdUser =
            await this.userRepository.findUserById(createdUserId)
        // const createdUserFullInformation = this.authService.usersMapping(newUser);
        try {
            await this.emailService.sendConfirmationEmail(
                createdEmailConfirmation.confirmationCode,
                createdUser!.email
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
