import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../../../../prisma/prisma.service'

@Injectable()
export class PostsService {
    constructor(private readonly prisma: PrismaService) {}

    // Создание черновика поста с изображением
    async createDraft(profileId: number, imageUrl: string) {
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
    async publishPost(postId: number, profileId: number, description: string) {
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
    }

    // Возвращение черновика поста для редактирования
    async getDraftById(postId: number, profileId: number) {
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
    }

    // Удаление черновика
    // async discardDraft(postId: number, profileId: number) {
    //     return this.prisma.post.delete({
    //         where: { id: postId, profileId, isDraft: true },
    //     })
    // }
}
