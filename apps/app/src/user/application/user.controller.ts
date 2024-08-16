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
            const foundUserIdByToken: number | null =
                await this.commandBus.execute(
                    new GetUserIdByUserIdCommand(req.user.userId)
                )
            if (foundUserIdByUrlId !== foundUserIdByToken) {
                throw new ForbiddenException()
            } else {
                await this.commandBus.execute(
                    new UpdateProfileCommand(
                        createProfileDto,
                        foundUserIdByToken
                    )
                )
            }
        } else {
            throw new NotFoundException()
        }
    }
}
