import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    NotFoundException,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { UserQueryRepository } from '../user.query.repository'
import { CreteProfileDto } from '../dto/CreteProfileDto'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { GetUserIdByUserIdCommand } from './use-cases/GetUserIdByUserId.useCase'
import { UpdateProfileCommand } from './use-cases/UpdateProfile.useCase'
import { ApiTags } from '@nestjs/swagger'
import { isOlderThan13 } from '../../../helpers/functions'
import { GetUserByIdFromTokenCommand } from './use-cases/GetUserByIdFromTokenUseCase'
import { UserWithEmailViewModel } from '../../../helpers/types'

@ApiTags('my-profile')
@Controller('my-profile')
export class UserController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly userQueryRepository: UserQueryRepository
    ) {}

    @Get(':id')
    async myProfile() {}

    @Post(':id/settings')
    @UseGuards(JwtAuthGuard)
    async settings(
        @Req() req,
        @Body() createProfileDto: CreteProfileDto,
        @Param('id') id: string
    ) {
        const foundUserIdByUrlId: number | null = await this.commandBus.execute(
            new GetUserIdByUserIdCommand(id)
        )
        if (foundUserIdByUrlId) {
            const foundUserByToken: UserWithEmailViewModel | null =
                await this.commandBus.execute(
                    new GetUserByIdFromTokenCommand(req.user.userId)
                )
            if (foundUserIdByUrlId !== foundUserByToken.id) {
                throw new ForbiddenException()
            } else {
                if (!foundUserByToken.isConfirmed)
                    return 'Error! Server is not available!'
                if (isOlderThan13(createProfileDto.dateOfBirth)) {
                    await this.commandBus.execute(
                        new UpdateProfileCommand(
                            createProfileDto,
                            foundUserByToken.id
                        )
                    )
                } else {
                    return 'A user under 13 cannot create a profile. Privacy Policy'
                }
            }
        } else {
            throw new NotFoundException()
        }
    }
}
