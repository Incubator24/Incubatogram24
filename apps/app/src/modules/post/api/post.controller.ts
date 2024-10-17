import {
    BadRequestException,
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
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { PostsService } from '../application/post.service'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { CommandBus } from '@nestjs/cqrs'
import { UserId } from '../../auth/api/decorators/user.decorator'
import { CreatePostEndpoint } from '../../../swagger/post/CreatePostEndPoint'
import { CreatePostInputDto } from './dto/input/CreatePostInputDto'
import { UpdatePostEndpoint } from '../../../swagger/post/UpdatePostEndPoint'
import { UpdatePostInputDto } from './dto/input/UpdatePostInputDto'
import { GetPostEndpoint } from '../../../swagger/post/GetPostEndPoint'
import { DeletePostEndpoint } from '../../../swagger/post/DeletePostEndPoint'
import { GetPostsEndpoint } from '../../../swagger/post/GetPostsEndPoint'
import { GetPostsInputDto } from './dto/input/GetPostsInputDto'

@Controller('posts')
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        private readonly commandBus: CommandBus
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @CreatePostEndpoint()
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FilesInterceptor('files', 10))
    async createPost(
        @UploadedFiles(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: /jpeg|png/,
                })
                .addMaxSizeValidator({
                    maxSize: 20 * 1024 * 1024,
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                })
        )
        photos: Express.Multer.File[],
        @UserId()
        userId: number,
        @Body() createPostInputDto: CreatePostInputDto
    ) {
        const post = await this.postsService.createPost(
            userId,
            createPostInputDto,
            photos
        )
        if (!post.data) {
            switch (post.resultCode) {
                case HttpStatus.BAD_REQUEST:
                    throw new BadRequestException({
                        message: [{ message: post.message, field: post.field }],
                    })
                case HttpStatus.NOT_FOUND:
                    throw new NotFoundException({
                        message: [{ message: post.message, field: post.field }],
                    })
                default:
                    throw new BadRequestException({})
            }
        }

        return { id: post.data.id }
    }

    @Put(':postId')
    @UseGuards(JwtAuthGuard)
    @UpdatePostEndpoint()
    @HttpCode(HttpStatus.CREATED)
    async updatePost(
        @Body() updatePostInputDto: UpdatePostInputDto,
        @Param('postId') postId: string,
        @UserId() userId: number
    ) {
        const post = await this.postsService.updatePost(
            userId,
            postId,
            updatePostInputDto
        )
        if (!post.data) {
            switch (post.resultCode) {
                case HttpStatus.BAD_REQUEST:
                    throw new BadRequestException({
                        message: [{ message: post.message, field: post.field }],
                    })
                case HttpStatus.NOT_FOUND:
                    throw new NotFoundException({
                        message: [{ message: post.message, field: post.field }],
                    })
                default:
                    throw new BadRequestException({})
            }
        }
    }

    @Get(':postId')
    @UseGuards(JwtAuthGuard)
    @GetPostEndpoint()
    @HttpCode(HttpStatus.OK)
    async getPost(@Param('postId') postId: string, @UserId() userId: number) {
        const post = await this.postsService.getPost(postId)
        if (!post.data) {
            switch (post.resultCode) {
                case HttpStatus.NOT_FOUND:
                    throw new NotFoundException({
                        message: [{ message: post.message, field: post.field }],
                    })
                default:
                    throw new BadRequestException({})
            }
        }

        return post.data
    }

    @Delete(':postId')
    @UseGuards(JwtAuthGuard)
    @DeletePostEndpoint()
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePost(
        @Param('postId') postId: string,
        @UserId() userId: number
    ) {
        const post = await this.postsService.deletePost(postId, userId)
        if (!post.data) {
            switch (post.resultCode) {
                case HttpStatus.NOT_FOUND:
                    throw new NotFoundException({
                        message: [{ message: post.message, field: post.field }],
                    })
                case HttpStatus.FORBIDDEN:
                    throw new ForbiddenException({
                        message: [{ message: post.message, field: post.field }],
                    })
            }
        }
    }

    @Get()
    @GetPostsEndpoint()
    @HttpCode(HttpStatus.OK)
    async getPosts(@Query() getPostsInputDto: GetPostsInputDto) {
        const posts = await this.postsService.getPosts(
            getPostsInputDto.userId,
            getPostsInputDto.page
        )
        if (!posts.data) {
            switch (posts.resultCode) {
                case HttpStatus.NOT_FOUND:
                    throw new NotFoundException({
                        message: [
                            { message: posts.message, field: posts.field },
                        ],
                    })
                case HttpStatus.FORBIDDEN:
                    throw new ForbiddenException({
                        message: [
                            { message: posts.message, field: posts.field },
                        ],
                    })
                default:
                    throw new BadRequestException({})
            }
        }

        return posts.data
    }
}
