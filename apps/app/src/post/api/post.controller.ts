import { ApiTags } from '@nestjs/swagger'
import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Injectable,
    ParseFilePipeBuilder,
    Post,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { FilesInterceptor } from '@nestjs/platform-express'
import { UserId } from '../../auth/decorators/user.decorator'
import { SavePostImagesCommand } from './use-cases/SavePostImages'
import { CommandBus } from '@nestjs/cqrs'

@Injectable()
@ApiTags('create Post')
@Controller('create-post')
export class PostController {
    constructor(private readonly commandBus: CommandBus) {}

    @Post('new-post')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FilesInterceptor('files'))
    @UseGuards(JwtAuthGuard)
    async createPost(
        @UploadedFiles(
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
        files: Express.Multer.File[],
        @UserId() userId: number,
        @Body() decription: string
    ) {
        const uploadedAvatar = await this.commandBus.execute(
            new SavePostImagesCommand(userId, decription, files)
        )
    }
}
