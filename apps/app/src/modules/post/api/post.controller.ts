import {
    Controller,
    Post,
    Body,
    UseGuards,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    Request,
    HttpCode,
    HttpStatus,
    ParseFilePipeBuilder,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { PostsService } from '../application/post.service'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { CommandBus } from '@nestjs/cqrs'
import { UserId } from '../../auth/api/decorators/user.decorator'
import { SavePostImageCommand } from '../application/use-cases/SaveImage'

@Controller('posts')
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        private readonly commandBus: CommandBus
    ) {}

    @UseGuards(JwtAuthGuard)
    // @Post('upload')
    // @UseInterceptors(
    //     FileInterceptor('file', {
    //         storage: diskStorage({
    //             destination: './uploads', // Папка для загрузок
    //             filename: (req, file, callback) => {
    //                 const uniqueSuffix =
    //                     Date.now() + '-' + Math.round(Math.random() * 1e9)
    //                 const ext = extname(file.originalname)
    //                 callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
    //             },
    //         }),
    //         limits: { fileSize: 20 * 1024 * 1024 }, // Лимит 20Мб
    //         fileFilter: (req, file, callback) => {
    //             if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
    //                 callback(null, true)
    //             } else {
    //                 callback(
    //                     new BadRequestException('Unsupported file format'),
    //                     false
    //                 )
    //             }
    //         },
    //     })
    // )
    // async uploadImage(
    //     @UploadedFile() file: Express.Multer.File,
    //     @Request() req
    // ) {
    //     const profileId = req.user.profileId
    //
    //     // Сохраняем изображение в базу данных (вместе с postId)
    //     const imageUrl = `/uploads/${file.filename}`
    //     const post = await this.postsService.createDraft(profileId, imageUrl)
    //
    //     return { imageUrl, post }
    //}
    @UseGuards(JwtAuthGuard)
    @Post('image')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file'))
    async updateAvatar(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: /jpeg|png/, // Допустимые типы файлов: JPEG и PNG
                })
                .addMaxSizeValidator({
                    maxSize: 20 * 1024 * 1024, // Максимальный размер файла: 20 МБ
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY, // HTTP код ошибки: 422
                })
        )
        file: Express.Multer.File,
        @UserId() userId: number
    ) {
        const uploadImage = await this.commandBus.execute(
            new SavePostImageCommand(userId, file)
        )
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async publishPost(@Body() body, @Request() req) {
        const profileId = req.user.profileId
        const { postId, description } = body

        return this.postsService.publishPost(postId, profileId, description)
    }
}
