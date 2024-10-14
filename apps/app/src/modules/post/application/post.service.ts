import { HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../../../prisma/prisma.service'
import { CreatePostInputDto } from '../api/dto/input/CreatePostInputDto'
import { S3StorageAdapter } from '../../files/adapter/file-storage-adapter-service'
import { Post, Profile } from '@prisma/client'
import { ResultObject } from '../../../helpers/types/helpersType'
import { UserRepository } from '../../user/infrastructure/repositories/user.repository'

@Injectable()
export class PostsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userRepository: UserRepository,
        private fileStorage: S3StorageAdapter
    ) {}

    // Создание черновика поста с изображением
    async createPost(
        userId: number,
        createPostInputDto: CreatePostInputDto,
        photos: Express.Multer.File[]
    ): Promise<ResultObject<Post>> {
        const profile: Profile | null =
            await this.userRepository.foundProfileFromUserId(userId)
        //todo проверить существует ли профиль
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

                for (const path of photosPaths) {
                    await tx.postImage.create({
                        data: {
                            postId: post.id,
                            url: path.url,
                            fileId: path.fileId,
                        },
                    })
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

        // const post = await this.prisma.post.create({
        //     data: {
        //         profileId,
        //         isDraft: true,
        //         images: {
        //             create: { url: imageUrl }, // Сохраняем изображение
        //         },
        //     },
        //     include: { images: true },
        // })
        //
        // return post
    }

    // Публикация поста
    // async publishPost(postId: number, profileId: number, description: string) {
    // const post = await this.prisma.post.update({
    //     where: { id: postId, profileId },
    //     data: {
    //         description,
    //         isDraft: false, // Снимаем черновик
    //     },
    //     include: { images: true },
    // })
    //
    // return post
    // }

    // Возвращение черновика поста для редактирования
    // async getDraftById(postId: number, profileId: number) {
    // const post = await this.prisma.post.findFirst({
    //     where: { id: postId, profileId, isDraft: true },
    //     include: { images: true },
    // })
    //
    // if (!post) {
    //     throw new NotFoundException('Draft not found')
    // }
    //
    // return post
    // }

    // Удаление черновика
    // async discardDraft(postId: number, profileId: number) {
    //     return this.prisma.post.delete({
    //         where: { id: postId, profileId, isDraft: true },
    //     })
    // }
}
