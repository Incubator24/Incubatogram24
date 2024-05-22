import { CommandBus } from '@nestjs/cqrs'
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Injectable,
    Post,
} from '@nestjs/common'
import { CreateUserDto } from './dto/CreateUserDto'
import { mappingErrorStatus, ResultObject } from '../../helpers/helpersType'
import { CreateUserByRegistrationCommand } from './application/use-cases/CreateUserByRegistration'

@Injectable()
@Controller('auth')
export class AuthController {
    constructor(private readonly commandBus: CommandBus) {}
    @Post('/registration')
    @HttpCode(HttpStatus.CREATED)
    async registrationUser(@Body() createUserDto: CreateUserDto) {
        console.log('Received registration request with data:', createUserDto)
        const newUser: ResultObject<string> = await this.commandBus.execute(
            new CreateUserByRegistrationCommand(createUserDto)
        )
        console.log('Command executed, result:', newUser)
        if (newUser.data === null) return mappingErrorStatus(newUser)
        return true
    }
    @Get('get')
    async getUserr() {
        return 'hello world'
    }
}
