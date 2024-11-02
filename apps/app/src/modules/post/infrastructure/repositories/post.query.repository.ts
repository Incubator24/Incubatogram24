import { Injectable } from '@nestjs/common'
import { IPostRepository } from '../interfaces/post.repository.interface'
import { PrismaService } from '../../../../../../../prisma/prisma.service'
import {
    PaginatorDto,
    PostType,
} from '../../../../../../../libs/helpers/types/types'
import Configuration from '../../../../../../../libs/config/configuration'

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
            select: {
                id: true,
                createdAt: true,
                description: true,
                profile: {
                    select: {
                        aboutMe: true,
                        avatarId: true,
                        user: {
                            select: {
                                userName: true,
                            },
                        },
                    },
                },
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

        //для корректного пути к фотографиям
        post.images.forEach((image) => {
            image.url = `${
                Configuration.getConfiguration().YANDEX_S3_ENDPOINT_WITH_BUCKET
            }${image.url}`
        })
        //для корректного пути к аватару
        post.profile.avatarId = `${
            Configuration.getConfiguration().YANDEX_S3_ENDPOINT_WITH_BUCKET
        }${post.profile.avatarId}`

        return {
            id: post.id,
            createdAt: post.createdAt,
            description: post.description,
            avatarId: post.profile.avatarId,
            aboutMe: post.profile.aboutMe,
            username: post.profile.user.userName,
            postImages: post.images,
            //todo заглушка, т.к. не реализован функционал
            comments: [],
        }
    }

    async getPosts(
        profileId: number,
        page: number
    ): Promise<PaginatorDto<PostType>> {
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
            select: {
                id: true,
                createdAt: true,
                description: true,
                profile: {
                    select: {
                        aboutMe: true,
                        avatarId: true,
                        user: {
                            select: {
                                userName: true,
                            },
                        },
                    },
                },
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

        //для корректного пути к фотографиям
        posts.forEach((post) => {
            if (post.images || post.images.length === 0) {
                return null
            }

            post.profile.avatarId = `${
                Configuration.getConfiguration().YANDEX_S3_ENDPOINT_WITH_BUCKET
            }${post.profile.avatarId}`

            post.images = post.images.map((image) => ({
                ...image,
                url: `${
                    Configuration.getConfiguration()
                        .YANDEX_S3_ENDPOINT_WITH_BUCKET
                }${image.url}`,
            }))
        })

        const pagesCount = Math.ceil(postsCount / LIMIT)

        if (posts.length === 0) {
            return {
                items: [],
                page: page,
                pagesCount: 0,
            }
        }

        const mappedPosts: PostType[] = []
        posts.forEach((post) => {
            const tempPost: PostType = {
                id: post.id,
                createdAt: post.createdAt,
                aboutMe: post.profile.aboutMe,
                avatarId: post.profile.avatarId,
                username: post.profile.user.userName,
                description: post.description,
                postImages: post.images,
                //todo заглушка, т.к. не реализован функционал
                comments: [],
            }
            mappedPosts.push(tempPost)
        })
        return {
            page: page,
            pagesCount: pagesCount,
            items: mappedPosts,
        }
    }

    async getPublicPosts(page: number = 1): Promise<PaginatorDto<PostType>> {
        const LIMIT = 4

        const posts = await this.prisma.post.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            take: LIMIT,
            skip: (page - 1) * LIMIT,
            include: {
                profile: {
                    select: {
                        aboutMe: true,
                        avatarId: true,
                        user: {
                            select: {
                                userName: true,
                            },
                        },
                    },
                },
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

        //для корректного пути к фотографиям
        posts.forEach((post) => {
            if (post.images || post.images.length === 0) {
                return null
            }

            post.profile.avatarId = `${
                Configuration.getConfiguration().YANDEX_S3_ENDPOINT_WITH_BUCKET
            }${post.profile.avatarId}`

            post.images = post.images.map((image) => ({
                ...image,
                url: `${
                    Configuration.getConfiguration()
                        .YANDEX_S3_ENDPOINT_WITH_BUCKET
                }${image.url}`,
            }))
        })

        const postsCount = await this.prisma.post.count({
            where: {
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

        const mappedPosts: PostType[] = []
        posts.forEach((post) => {
            const tempPost: PostType = {
                id: post.id,
                createdAt: post.createdAt,
                aboutMe: post.profile.aboutMe,
                avatarId: post.profile.avatarId,
                username: post.profile.user.userName,
                description: post.description,
                postImages: post.images,
                //todo заглушка, т.к. не реализован функционал
                comments: [],
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
