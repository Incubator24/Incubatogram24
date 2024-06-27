import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ResultObject } from '../../../../helpers/helpersType'
import { AuthService } from '../../auth.service'
import { HttpStatus, Injectable } from '@nestjs/common'
import { CreateUserDto } from '../../dto/CreateUserDto'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../config/configuration'
import { Prisma } from '@prisma/client'
import { UserRepository } from '../../../user/user.repository'
import { v4 as uuidv4 } from 'uuid'
import { add } from 'date-fns'
import * as bcrypt from 'bcryptjs'
import { emailConfirmationType } from '../../../email/emailConfirmationType'
import { EmailService } from '../../../email/email.service'

@Injectable()
export class CreateUserByRegistrationCommand {
    constructor(public userPostInputData: CreateUserDto) {}
}

@CommandHandler(CreateUserByRegistrationCommand)
export class CreateUserByRegistration
    implements ICommandHandler<CreateUserByRegistrationCommand>
{
    constructor(
        public authService: AuthService,
        public userRepository: UserRepository,
        public emailService: EmailService,
        protected configService: ConfigService<ConfigType, true>
    ) {}

    async execute(
        command: CreateUserByRegistrationCommand
    ): Promise<ResultObject<number>> {
        const [isUserNameExist, isEmailExist] = await Promise.all([
            this.userRepository.findUserByLoginOrEmail(
                command.userPostInputData.userName
            ),
            this.userRepository.findUserByLoginOrEmail(
                command.userPostInputData.email
            ),
        ])

        if (isUserNameExist && isEmailExist) {
            return {
                resultCode: HttpStatus.BAD_REQUEST,
                field: 'email and username',
                message: 'Email and username already exist in system',
                data: null,
            }
        }

        if (isUserNameExist) {
            return {
                resultCode: HttpStatus.BAD_REQUEST,
                field: 'username',
                message: 'Username already exists in system',
                data: null,
            }
        }

        if (isEmailExist) {
            return {
                resultCode: HttpStatus.BAD_REQUEST,
                field: 'email',
                message: 'Email already exists in system',
                data: null,
            }
        }

        const passwordSaltNumber = this.configService.get<number>(
            'PASSWORD_SALT',
            10
        )
        const passwordSalt = await bcrypt.genSalt(Number(passwordSaltNumber))
        const passwordHash = await this.authService._generateHash(
            command.userPostInputData.password,
            passwordSalt
        )
        const dataForUser: Prisma.UserCreateInput = {
            email: command.userPostInputData.email,
            userName: command.userPostInputData.userName,
            passwordSalt,
            passwordHash,
        }
        const createdUserId = await this.userRepository.createUser(dataForUser)

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
