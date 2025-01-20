import { Delete, Injectable } from '@nestjs/common'
import { IPostRepository } from '../interfaces/post.repository.interface'
import { PrismaService } from '../../../../../../../prisma/prisma.service'
import { Post } from '@prisma/client'
import { PostImage } from '../../../../../../../libs/helpers/types/types'

@Injectable()
export class PostRepository implements IPostRepository {
    constructor(private prisma: PrismaService) {}

    async findPost(postId: string): Promise<Post | null> {
        return this.prisma.post.findUnique({
            where: {
                id: Number(postId),
            },
        })
    }

    async findPostImages(postId: string): Promise<PostImage[]> {
        return this.prisma.postImage.findMany({
            where: {
                postId: Number(postId),
            },
        })
    }

    async updatePost(postId: string, description: string): Promise<Post> {
        return this.prisma.post.update({
            data: {
                description: description,
            },
            where: {
                id: Number(postId),
            },
        })
    }

    async deletePost(postId: string): Promise<Post> {
        await this.prisma.postImage.deleteMany({
            where: { postId: Number(postId) },
        })
        return this.prisma.post.delete({
            where: {
                id: Number(postId),
            },
        })
    }
}
