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
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { CommandBus } from '@nestjs/cqrs'
import { DeleteAvatarUseCaseCommand } from '../application/use-cases/DeleteAvatar'
import { SaveAvatarUseCaseCommand } from '../application/use-cases/SaveAvatar'

import { UserQueryRepository } from '../infrastructure/repositories/user.query.repository'
import { CreateProfileDto } from './dto/CreateProfileDto'
import { UpdateProfileCommand } from '../application/use-cases/UpdateProfile'
import { UpdateProfileDto } from './dto/UpdateProfileDto'
import { CreateProfileCommand } from '../application/use-cases/CreateProfile'
import { RemoveUserByIdCommand } from '../application/use-cases/RemoveUserById'
import { IUserRepository } from '../infrastructure/interfaces/user.repository.interface'
import { GetMyProfileEndpoint } from '../../../../../../libs/swagger/user/GetMyProfileEndpoint'
import { GetProfileEndpoint } from '../../../../../../libs/swagger/user/GetProfileEndpoint'
import { CreateProfileEndpoint } from '../../../../../../libs/swagger/user/CreateProfileEndpoint'
import { mappingErrorStatus } from '../../../../../../libs/helpers/types/helpersType'
import { UpdateProfileEndpoint } from '../../../../../../libs/swagger/user/UpdateProfileEndpoint'
import { GetAvatarEndpoint } from '../../../../../../libs/swagger/user/GetAvatarEndpoint'
import Configuration from '../../../../../../libs/config/configuration'
import { UpdateAvatarEndpoint } from '../../../../../../libs/swagger/user/UpdateAvatarEndpoint'
import { DeleteAvatarEndpoint } from '../../../../../../libs/swagger/user/DeleteAvatarEndpoint'
import { GetAllUsersEndpoint } from '../../../../../../libs/swagger/superAdmin/GetAllUsers'
import { RemoveUserByIdEndpoint } from '../../../../../../libs/swagger/superAdmin/RemoveUserById'
import { JwtAuthGuard } from '../../../../../../libs/guards/jwt-auth.guard'
import { UserId } from '../../../../../../libs/decorators/user.decorator'

@Controller('profile')
export class UserController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly userRepository: IUserRepository,
        private readonly userQueryRepository: UserQueryRepository
    ) {}

    @Get('me')
    @GetMyProfileEndpoint()
    @UseGuards(JwtAuthGuard)
    async getMyProfile(
        @UserId()
        userId: number
    ) {
        const getProfile = await this.userQueryRepository.getProfile(userId)
        if (getProfile) {
            return getProfile
        } else {
            throw new NotFoundException()
        }
    }

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

    // @Post('settings')
    // @CreateProfileEndpoint()
    // @UseGuards(JwtAuthGuard)
    // async createProfile(
    //     @UserId()
    //     userId: number,
    //     @Body()
    //     createProfileDto: CreateProfileDto
    // ) {
    //     const createdProfile = await this.commandBus.execute(
    //         new CreateProfileCommand(createProfileDto, userId)
    //     )
    //     if (createdProfile.data === null)
    //         return mappingErrorStatus(createdProfile)
    //     return await this.userQueryRepository.getProfile(userId)
    // }

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
        console.log(1)
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
        console.log(1)
        const uploadedAvatar = await this.commandBus.execute(
            new SaveAvatarUseCaseCommand(userId, file)
        )
        console.log(2)
        if (uploadedAvatar.data === null)
            return mappingErrorStatus(uploadedAvatar)
        console.log(3)
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
