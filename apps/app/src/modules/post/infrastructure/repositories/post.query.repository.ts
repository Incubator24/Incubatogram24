import { Injectable } from '@nestjs/common'
import { IPostRepository } from '../interfaces/post.repository.interface'
import { PrismaService } from '../../../../../../../prisma/prisma.service'
import { PaginatorDto, PostType } from '../../../../helpers/types/types'

@Injectable()
export class PostQueryRepository implements IPostRepository {
    constructor(private prisma: PrismaService) {}

    async getPost(postId: string): Promise<PostType | null> {
        const post = await this.prisma.post.findUnique({
            where: {
                id: Number(postId),
                deletedAt: null,
                isDraft: false,
            },
            include: {
                images: {
                    select: {
                        id: true,
                        url: true,
                        fileId: true,
                        order: true,
                    },
                },
            },
        })
        if (!post) {
            return null
        }
        return {
            id: post.id,
            description: post.description,
            isDraft: post.isDraft,
            postImages: post.images,
        }
    }

    async getPosts(
        profileId: number,
        page: number
    ): Promise<PaginatorDto<PostType[]>> {
        const LIMIT = 8

        const posts = await this.prisma.post.findMany({
            where: {
                profile: {
                    id: profileId,
                },
                deletedAt: null,
                isDraft: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: LIMIT,
            skip: (page - 1) * LIMIT,
            include: {
                images: {
                    select: {
                        id: true,
                        url: true,
                        fileId: true,
                        order: true,
                    },
                },
            },
        })

        const postsCount = await this.prisma.post.count({
            where: {
                profile: {
                    id: profileId,
                },
                deletedAt: null,
                isDraft: false,
            },
        })

        const pagesCount = Math.ceil(postsCount / LIMIT)

        if (posts.length === 0) {
            return {
                items: [],
                page: page,
                pagesCount: 0,
            }
        }

        const mappedPosts = []
        posts.forEach((post) => {
            const tempPost = {
                id: post.id,
                description: post.description,
                isDraft: post.isDraft,
                postImages: post.images,
            }
            mappedPosts.push(tempPost)
        })
        return {
            page: page,
            pagesCount: pagesCount,
            items: mappedPosts,
        }
    }
}
