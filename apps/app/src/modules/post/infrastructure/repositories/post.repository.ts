import { Delete, Injectable } from '@nestjs/common'
import { IPostRepository } from '../interfaces/post.repository.interface'
import { PrismaService } from '../../../../../../../prisma/prisma.service'
import { Post } from '@prisma/client'

@Injectable()
export class PostRepository implements IPostRepository {
    constructor(private prisma: PrismaService) {}

    async findPost(postId: string): Promise<Post> {
        return this.prisma.post.findUnique({
            where: {
                id: Number(postId),
                deletedAt: null,
                isDraft: false,
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
                deletedAt: null,
                isDraft: false,
            },
        })
    }

    async deletePost(postId: string): Promise<Post> {
        return this.prisma.post.update({
            data: {
                deletedAt: new Date().toISOString(),
            },
            where: {
                id: Number(postId),
                deletedAt: null,
                isDraft: false,
            },
        })
    }
}
