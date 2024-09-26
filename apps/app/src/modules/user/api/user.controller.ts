import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    ParseFilePipeBuilder,
    Post,
    Put,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { CommandBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { UserId } from '../../auth/api/decorators/user.decorator'
import { DeleteAvatarUseCaseCommand } from '../application/use-cases/DeleteAvatar'
import { SaveAvatarUseCaseCommand } from '../application/use-cases/SaveAvatar'

import { UserQueryRepository } from '../infrastructure/repositories/user.query.repository'
import { CreateProfileDto } from './dto/CreateProfileDto'
import { UpdateProfileCommand } from '../application/use-cases/UpdateProfile'
import { UserRepository } from '../infrastructure/repositories/user.repository'
import { UpdateProfileDto } from './dto/UpdateProfileDto'
import { CreateProfileCommand } from '../application/use-cases/CreateProfile'
import { RemoveUserByIdCommand } from '../application/use-cases/RemoveUserById'
import { GetProfileEndpoint } from '../../../swagger/user/GetProfileEndpoint'
import { CreateProfileEndpoint } from '../../../swagger/user/CreateProfileEndpoint'
import { UpdateProfileEndpoint } from '../../../swagger/user/UpdateProfileEndpoint'
import { mappingErrorStatus } from '../../../helpers/types/helpersType'
import Configuration from '../../../config/configuration'
import { UpdateAvatarEndpoint } from '../../../swagger/user/UpdateAvatarEndpoint'
import { GetAllUsersEndpoint } from '../../../swagger/superAdmin/GetAllUsers'
import { RemoveUserByIdEndpoint } from '../../../swagger/superAdmin/RemoveUserById'
import { GetAvatarEndpoint } from '../../../swagger/user/GetAvatarEndpoint'
import { DeleteAvatarEndpoint } from '../../../swagger/user/DeleteAvatarEndpoint'
import { IUserRepository } from '../infrastructure/interfaces/user.repository.interface'

@Controller('profile')
export class UserController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly userRepository: IUserRepository,
        private readonly userQueryRepository: UserQueryRepository
    ) {}

    @Get(':id')
    @GetProfileEndpoint()
    async getProfile(@Param('id') id: string) {
        const getProfile = await this.userQueryRepository.getProfile(+id)
        if (getProfile) {
            return getProfile
        } else {
            throw new NotFoundException()
        }
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
        return await this.userQueryRepository.getProfile(userId)
    }

    @Put('settings')
    @HttpCode(HttpStatus.NO_CONTENT)
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

    @Get('avatar/:userId')
    @GetAvatarEndpoint()
    @HttpCode(HttpStatus.OK)
    async getAvatar(@Param('userId') userId: number) {
        const foundProfileFromUserId =
            await this.userRepository.foundProfileFromUserId(userId)
        console.log('foundProfileFromUserId = ', Date.now())
        if (!foundProfileFromUserId) {
            return 'This user hasn`t avatar'
        } else if (foundProfileFromUserId.avatarId === null)
            return 'This user hasn`t avatar'

        // res.redirect(
        //     Configuration.getConfiguration().YANDEX_S3_ENDPOINT_WITH_BUCKET +
        //         foundProfileFromUserId.avatarId
        // )
        //change redirect
        return {
            url:
                Configuration.getConfiguration()
                    .YANDEX_S3_ENDPOINT_WITH_BUCKET +
                foundProfileFromUserId.avatarId,
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
        console.log('userId1 = ', userId)
        const uploadedAvatar = await this.commandBus.execute(
            new SaveAvatarUseCaseCommand(userId, file)
        )
        if (uploadedAvatar.data === null)
            return mappingErrorStatus(uploadedAvatar)

        return 'Avatar success updated'
    }

    @UseGuards(JwtAuthGuard)
    @Delete('avatar')
    @DeleteAvatarEndpoint()
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
