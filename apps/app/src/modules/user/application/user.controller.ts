import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseFilePipeBuilder,
    Post,
    Put,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { CommandBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { UserId } from '../../auth/api/decorators/user.decorator'
import { DeleteAvatarUseCaseCommand } from './use-cases/DeleteAvatar'
import { SaveAvatarUseCaseCommand } from './use-cases/SaveAvatar'

import { UserQueryRepository } from '../infrastructure/repositories/user.query.repository'
import { CreateProfileDto } from '../dto/CreateProfileDto'
import { UpdateProfileCommand } from './use-cases/UpdateProfile'
import { UserRepository } from '../infrastructure/repositories/user.repository'
import { UpdateProfileDto } from '../dto/UpdateProfileDto'
import { CreateProfileCommand } from './use-cases/CreateProfile'
import { RemoveUserByIdCommand } from './use-cases/RemoveUserById'
import { GetProfileEndpoint } from '../../../swagger/user/GetProfileEndpoint'
import { CreateProfileEndpoint } from '../../../swagger/user/CreateProfileEndpoint'
import { UpdateProfileEndpoint } from '../../../swagger/user/UpdateProfileEndpoint'
import { mappingErrorStatus } from '../../../helpers/types/helpersType'
import Configuration from '../../../config/configuration'
import { UpdateAvatarEndpoint } from '../../../swagger/user/UpdateAvatarEndpoint'
import { GetAllUsersEndpoint } from '../../../swagger/for-test/GetAllUsers'
import { RemoveUserByIdEndpoint } from '../../../swagger/for-test/RemoveUserById'

@ApiTags('profile')
@Controller('profile')
export class UserController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly userRepository: UserRepository,
        private readonly userQueryRepository: UserQueryRepository
    ) {}

    @Get(':id')
    @GetProfileEndpoint()
    async getProfile(@Param('id') id: string) {
        return await this.userQueryRepository.findUserById(+id)
    }

    @Post('settings')
    @CreateProfileEndpoint()
    @UseGuards(JwtAuthGuard)
    async creteProfile(
        @UserId()
        userId: number,
        @Body()
        createProfileDto: CreateProfileDto
    ) {
        const createdProfile = await this.commandBus.execute(
            new CreateProfileCommand(createProfileDto, userId)
        )
        if (createdProfile.data === null)
            return mappingErrorStatus(createdProfile)
        return createdProfile
    }

    @Put('settings')
    @UpdateProfileEndpoint()
    @UseGuards(JwtAuthGuard)
    async changeProfile(
        @UserId()
        userId: number,
        @Body()
        updateProfileDto: UpdateProfileDto
    ) {
        const updateProfile = await this.commandBus.execute(
            new UpdateProfileCommand(updateProfileDto, userId)
        )
        if (updateProfile.data === null)
            return mappingErrorStatus(updateProfile)
        return updateProfile
    }

    @Get('avatar')
    @HttpCode(HttpStatus.OK)
    async getAvatar(
        @Query('userId')
        userId: number
    ) {
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
        @UserId()
        userId: number
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
    async deleteAvatar(
        @UserId()
        userId: number
    ) {
        const deletedAvatar = await this.commandBus.execute(
            new DeleteAvatarUseCaseCommand(userId)
        )
        if (deletedAvatar.data === null)
            return mappingErrorStatus(deletedAvatar)

        return 'avatar success deleted'
    }

    // for testing
    @Get()
    @GetAllUsersEndpoint()
    async getAllUsers() {
        return this.userQueryRepository.getAllUsers()
    }

    @Delete(':userId')
    @RemoveUserByIdEndpoint()
    async removeUserById(
        @Param('userId')
        userId: string
    ) {
        return await this.commandBus.execute(new RemoveUserByIdCommand(userId))
    }
}
