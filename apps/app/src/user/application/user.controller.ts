import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Injectable,
    ParseFilePipeBuilder,
    Put,
    Query,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { CommandBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { UserId } from '../../auth/decorators/user.decorator'
import { DeleteAvatarUseCaseCommand } from './use-cases/DeleteAvatarUseCase'
import { SaveAvatarUseCaseCommand } from './use-cases/SaveAvatarUseCase'
import { Response } from 'express'
import Configuration from '../../config/configuration'
import { UserRepository } from '../user.repository'
import { UpdateAvatarEndpoint } from '../swagger/UpdateAvatarEndpoint'
import { mappingErrorStatus } from '../../../helpers/helpersType'

@Injectable()
@ApiTags('my-profile')
@Controller('my-profile')
export class UserController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly userRepository: UserRepository
    ) {}

    @Get('avatar')
    @HttpCode(HttpStatus.OK)
    async getAvatar(@Query('userId') userId: number, @Res() res: Response) {
        const userInfo = await this.userRepository.findUserById(userId)
        if (userInfo.avatarId === null) {
            return 'This user hasn`t avatar'
        }
        res.redirect(
            Configuration.getConfiguration().YANDEX_S3_ENDPOINT_WITH_BUCKET +
                userInfo.avatarId
        )
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
