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
import { GetPostsInputDto } from './dto/input/GetPostsInputDto'
import { JwtAuthGuard } from '../../../../../../libs/guards/jwt-auth.guard'
import { CreatePostEndpoint } from '../../../../../../libs/swagger/post/CreatePostEndPoint'
import { UserId } from '../../../../../../libs/decorators/user.decorator'
import { CreatePostInputDto } from './dto/input/CreatePostInputDto'
import { UpdatePostEndpoint } from '../../../../../../libs/swagger/post/UpdatePostEndPoint'
import { UpdatePostInputDto } from './dto/input/UpdatePostInputDto'
import { GetPostEndpoint } from '../../../../../../libs/swagger/post/GetPostEndPoint'
import { DeletePostEndpoint } from '../../../../../../libs/swagger/post/DeletePostEndPoint'
import { GetPostsEndpoint } from '../../../../../../libs/swagger/post/GetPostsEndPoint'
import { GetPostsPublicEndPoint } from '../../../../../../libs/swagger/post/GetPostsPublicEndPoint'
import { GetPostPublicEndpoint } from '../../../../../../libs/swagger/post/GetPostPublicEndPoint'

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Get('public')
    @GetPostsPublicEndPoint()
    @HttpCode(HttpStatus.OK)
    async getPublicPosts(@Query() getPostsInputDto: GetPostsInputDto) {
        const { page = 1 } = getPostsInputDto
        const posts = await this.postsService.getPublicPosts(page)

        return posts.data
    }

    @Get(':postId/public')
    @GetPostPublicEndpoint()
    @HttpCode(HttpStatus.OK)
    async getPostPublic(@Param('postId') postId: string) {
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

    @Get()
    @UseGuards(JwtAuthGuard)
    @GetPostsEndpoint()
    @HttpCode(HttpStatus.OK)
    async getPosts(
        @Query() getPostsInputDto: GetPostsInputDto,
        @UserId() userId: number
    ) {
        const posts = await this.postsService.getPosts(
            userId,
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
    @HttpCode(HttpStatus.NO_CONTENT)
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
        console.log('post = ', post)
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
                case HttpStatus.FORBIDDEN:
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
    async getPost(@Param('postId') postId: string) {
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
}
