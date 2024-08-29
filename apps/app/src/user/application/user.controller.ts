import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    ParseFilePipeBuilder,
    Post,
    Put,
    Query,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { CommandBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { UserId } from '../../auth/decorators/user.decorator'
import { DeleteAvatarUseCaseCommand } from './use-cases/DeleteAvatar'
import { SaveAvatarUseCaseCommand } from './use-cases/SaveAvatar'
import Configuration from '../../config/configuration'
import { UpdateAvatarEndpoint } from '../swagger/UpdateAvatarEndpoint'
import { mappingErrorStatus } from '../../../helpers/helpersType'

import { UserQueryRepository } from '../user.query.repository'
import { CreteProfileDto } from '../dto/CreteProfileDto'
import { GetUserIdByUserIdCommand } from './use-cases/GetUserIdByUserId'
import { UpdateProfileCommand } from './use-cases/UpdateProfile'
import { isOlderThan13 } from '../../../helpers/functions'
import { GetUserByIdFromTokenCommand } from './use-cases/GetUserByIdFromToken'
import { UserWithEmailViewModel } from '../../../helpers/types'
import { UserRepository } from '../user.repository'

@ApiTags('my-profile')
@Controller('my-profile')
export class UserController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly userRepository: UserRepository,
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

    @Put(':id/settings')
    @UseGuards(JwtAuthGuard)
    async changeProfile() {}

    @Get('avatar')
    @HttpCode(HttpStatus.OK)
    async getAvatar(@Query('userId') userId: number) {
        const userInfo = await this.userRepository.findUserById(userId)
        //fix this
        if (userInfo.avatarId === null) {
            return 'This user hasn`t avatar'
        }

        // res.redirect(
        //     Configuration.getConfiguration().YANDEX_S3_ENDPOINT_WITH_BUCKET +
        //         userInfo.avatarId
        // )
        //change redirect
        return {
            url:
                Configuration.getConfiguration()
                    .YANDEX_S3_ENDPOINT_WITH_BUCKET + userInfo.avatarId,
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put('avatar')
    @UpdateAvatarEndpoint()
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file'))
    async updateAvatar(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: /jpeg|png/,
                })
                .addMaxSizeValidator({
                    maxSize: 10000000,
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                })
        )
        file: Express.Multer.File,
        @UserId() userId: number
    ) {
        const uploadedAvatar = await this.commandBus.execute(
            new SaveAvatarUseCaseCommand(userId, file)
        )
        if (uploadedAvatar.data === null)
            return mappingErrorStatus(uploadedAvatar)

        return 'Avatar success updated'
    }

    @UseGuards(JwtAuthGuard)
    @Delete('avatar')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseInterceptors(FileInterceptor('file'))
    async deleteAvatar(@UserId() userId: number) {
        const deletedAvatar = await this.commandBus.execute(
            new DeleteAvatarUseCaseCommand(userId)
        )
        if (deletedAvatar.data === null)
            return mappingErrorStatus(deletedAvatar)

        return 'avatar success deleted'
    }
}
