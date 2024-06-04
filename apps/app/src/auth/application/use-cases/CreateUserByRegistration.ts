import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ResultObject } from '../../../../helpers/helpersType'
import * as bcrypt from 'bcrypt'
import { AuthService } from '../../auth.service'
import { HttpStatus, Injectable } from '@nestjs/common'
import { CreateUserDto } from '../../dto/CreateUserDto'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../config/configuration'
import { Prisma } from '@prisma/client'
import { UserRepository } from '../../../user/user.repository'

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
        protected configService: ConfigService<ConfigType, true>
    ) {}

    async execute(
        command: CreateUserByRegistrationCommand
    ): Promise<ResultObject<number>> {
        // const passwordSalt = await bcrypt.genSalt(
        //     this.configService.get<number>('PASSWORD_SALT', 10)
        // )
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
        console.log('User created successfully with ID:', createdUserId)

        return {
            data: createdUserId,
            resultCode: HttpStatus.NO_CONTENT,
        }
    }
}
