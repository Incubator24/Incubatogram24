import { HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../../../prisma/prisma.service'
import { CreatePostInputDto } from '../api/dto/input/CreatePostInputDto'
import { S3StorageAdapter } from '../../files/adapter/file-storage-adapter-service'
import { Post, Profile } from '@prisma/client'
import { ResultObject } from '../../../helpers/types/helpersType'
import { UserRepository } from '../../user/infrastructure/repositories/user.repository'
import { UpdatePostInputDto } from '../api/dto/input/UpdatePostInputDto'
import { PostRepository } from '../infrastructure/repositories/post.repository'
import { PostQueryRepository } from '../infrastructure/repositories/post.query.repository'
import { PaginatorDto, PostType } from '../../../helpers/types/types'

@Injectable()
export class PostsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userRepository: UserRepository,
        private readonly postRepository: PostRepository,
        private readonly postQueryRepository: PostQueryRepository,
        private fileStorage: S3StorageAdapter
    ) {}

    // Создание поста с изображениями
    async createPost(
        userId: number,
        createPostInputDto: CreatePostInputDto,
        photos: Express.Multer.File[]
    ): Promise<ResultObject<Post>> {
        const profile: Profile | null =
            await this.userRepository.foundProfileFromUserId(userId)
        //проверить существует ли профиль
        if (!profile) {
            return {
                data: null,
                resultCode: HttpStatus.NOT_FOUND,
                message: 'profile was not found',
                field: 'profileId',
            }
        }

        const photosPaths: { url: string; fileId: string }[] = []
        try {
            //добавление фото на S3
            for (const photo of photos) {
                try {
                    const photoPath = await this.fileStorage.saveImage(
                        userId,
                        photo.originalname,
                        photo.mimetype,
                        photo.buffer,
                        'post_photos'
                    )
                    photosPaths.push({
                        url: photoPath.url,
                        fileId: photoPath.fileId,
                    })
                } catch (error) {
                    console.error(
                        `Ошибка при сохранении изображения ${photo.originalname}:`,
                        error
                    )
                }
            }

            //это надо вынести в post repository
            //создание в бд поста, и фотографий поста
            let post: Post
            await this.prisma.$transaction(async (tx) => {
                post = await tx.post.create({
                    data: {
                        profileId: profile.id,
                        createdAt: new Date().toISOString(),
                        isDraft: createPostInputDto.isDraft,
                        description: createPostInputDto.description,
                    },
                })

                let index = 1
                for (const path of photosPaths) {
                    await tx.postImage.create({
                        data: {
                            postId: post.id,
                            url: path.url,
                            fileId: path.fileId,
                            order: index,
                        },
                    })
                    index++
                }
            })
            return {
                data: post,
                resultCode: HttpStatus.CREATED,
            }
        } catch (error) {
            console.error(
                'Ошибка при выполнении транзакции (Post Service: Create Draft) :',
                error
            )
            //если что-то пошло не так, то удаляем фото с S3
            for (const path of photosPaths) {
                try {
                    await this.fileStorage.deleteImage(path.url)
                } catch (error) {
                    console.error(
                        `Ошибка при удалении изображения: ${path.url}:`,
                        error
                    )
                }
            }
            return {
                data: null,
                resultCode: HttpStatus.BAD_REQUEST,
                message: 'post was not created',
                field: 'post',
            }
        }
    }

    // обновление поста
    async updatePost(
        userId: number,
        postId: string,
        updatePostInputDto: UpdatePostInputDto
    ): Promise<ResultObject<PostType>> {
        const post = await this.postRepository.findPost(postId)
        //проверить существует ли пост
        if (!post) {
            return {
                data: null,
                resultCode: HttpStatus.NOT_FOUND,
                message: 'post was not found',
                field: 'postId',
            }
        }

        //проверить является ли юзер владельцем поста
        const profile = await this.userRepository.foundProfileFromUserId(userId)
        if (post.profileId !== profile.id) {
            return {
                data: null,
                resultCode: HttpStatus.FORBIDDEN,
                message: 'user is not post owner',
                field: 'userId',
            }
        }

        const updatedPost: Post = await this.postRepository.updatePost(
            postId,
            updatePostInputDto.description
        )
        //проверить обновлён ли пост
        if (!updatedPost) {
            return {
                data: null,
                resultCode: HttpStatus.NOT_FOUND,
                message: 'post was not updated',
                field: 'postId',
            }
        }

        const mappedPost = await this.postQueryRepository.getPost(postId)

        return {
            data: mappedPost,
            resultCode: HttpStatus.NO_CONTENT,
        }
    }

    // получения поста, не черновика
    async getPost(postId: string): Promise<ResultObject<PostType>> {
        const post = await this.postQueryRepository.getPost(postId)
        //проверить существует ли пост
        if (!post) {
            return {
                data: null,
                resultCode: HttpStatus.NOT_FOUND,
                message: 'post was not found',
                field: 'postId',
            }
        }

        return {
            data: post,
            resultCode: HttpStatus.OK,
        }
    }

    // удаление поста, не черновика
    async deletePost(
        postId: string,
        userId: number
    ): Promise<ResultObject<null>> {
        const post = await this.postRepository.findPost(postId)
        //проверить существует ли пост
        if (!post) {
            return {
                data: null,
                resultCode: HttpStatus.NOT_FOUND,
                message: 'post was not found',
                field: 'postId',
            }
        }

        const profile = await this.userRepository.foundProfileFromUserId(userId)
        if (post.profileId !== profile.id) {
            return {
                data: null,
                resultCode: HttpStatus.FORBIDDEN,
                message: 'user is not post owner',
                field: 'userId',
            }
        }

        const deletedPost = await this.postRepository.deletePost(postId)
        if (!deletedPost) {
            return {
                data: null,
                resultCode: HttpStatus.NOT_FOUND,
                message: 'post was not deleted',
                field: 'postId',
            }
        }

        return {
            data: null,
            resultCode: HttpStatus.NO_CONTENT,
        }
    }

    // получение постов с пагинацией поста, не черновиков
    async getPosts(
        userId: number,
        page: number
    ): Promise<ResultObject<PaginatorDto<PostType[]>>> {
        const profile = await this.userRepository.foundProfileFromUserId(userId)
        if (!profile) {
            return {
                data: null,
                resultCode: HttpStatus.NOT_FOUND,
                message: 'user profile was not found',
                field: 'userId',
            }
        }

        const posts = await this.postQueryRepository.getPosts(profile.id, page)

        return {
            data: posts,
            resultCode: HttpStatus.OK,
        }
    }
}
