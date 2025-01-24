import { HttpStatus, Injectable } from '@nestjs/common'
import { IPostRepository } from '../interfaces/post.repository.interface'
import { PrismaService } from '../../../../../../../prisma/prisma.service'
import {
    PaginatorPostItems,
    PostType,
    PostViewModel,
} from '../../../../../../../libs/helpers/types/types'
import Configuration from '../../../../../../../libs/config/configuration'
import { ResultObject } from '../../../../../../../libs/helpers/types/helpersType'

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
        post.profile.avatarId === null
            ? post.profile.avatarId
            : `${
                  Configuration.getConfiguration()
                      .YANDEX_S3_ENDPOINT_WITH_BUCKET
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

    async getAllPostsCurrentUser(
        profileId: number,
        pageNumberQuery: number | undefined
    ): Promise<ResultObject<PostViewModel> | null> {
        const LIMIT = 8
        pageNumberQuery = pageNumberQuery ? pageNumberQuery : 1

        const posts = await this.prisma.post.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            where: {
                deletedAt: null,
                isDraft: true,
                profileId: profileId,
            },
            take: LIMIT,
            skip: (pageNumberQuery - 1) * LIMIT,
            include: {
                profile: {
                    select: {
                        avatarId: true,
                        user: {
                            select: {
                                id: true,
                                userName: true,
                            },
                        },
                    },
                },
                images: {
                    select: {
                        id: true,
                        url: true,
                    },
                },
            },
        })

        if (!posts) {
            return {
                data: null,
                resultCode: HttpStatus.NOT_FOUND,
                message: 'posts not found',
                field: 'posts',
            }
        }
        //для корректного пути к фотографиям
        posts.forEach((post) => {
            if (post.profile.avatarId) {
                post.profile.avatarId = `${
                    Configuration.getConfiguration().YANDEX_S3_ENDPOINT
                }${post.profile.avatarId}`
            }

            if (post.images && post.images.length > 0) {
                post.images = post.images.map((image) => ({
                    ...image,
                    url: `${
                        Configuration.getConfiguration().YANDEX_S3_ENDPOINT
                    }${image.url}`,
                }))
            }
        })

        const usersCount = await this.prisma.user.count({
            where: {
                isDeleted: false,
            },
        })

        if (posts.length === 0) {
            return {
                data: { items: [], usersCount: usersCount },
                resultCode: HttpStatus.OK,
                message: 'posts',
                field: 'posts',
            }
        }

        const mappedPosts: PaginatorPostItems[] = []
        posts.forEach((post) => {
            const tempPost: PaginatorPostItems = {
                postId: post.id,
                userId: post.profile.user.id,
                username: post.profile.user.userName,
                avatar_url: post.profile.avatarId,
                description: post.description,
                createdAt: post.createdAt.toISOString(),
                updatedAt: post.updatedAt.toISOString(),
                postImages: post.images,
                //todo заглушка, т.к. не реализован функционал
                comments: [],
            }
            mappedPosts.push(tempPost)
        })
        return {
            data: { items: mappedPosts, usersCount: usersCount },
            resultCode: HttpStatus.OK,
            message: 'posts',
            field: 'posts',
        }
    }

    // async getPosts(
    //     profileId: number,
    //     page: number
    // ): Promise<PaginatorDto<PostType>> {
    //     const LIMIT = 8
    //
    //     const posts = await this.prisma.post.findMany({
    //         where: {
    //             profile: {
    //                 id: profileId,
    //             },
    //             deletedAt: null,
    //             isDraft: false,
    //         },
    //         orderBy: {
    //             createdAt: 'desc',
    //         },
    //         take: LIMIT,
    //         skip: (page - 1) * LIMIT,
    //         select: {
    //             id: true,
    //             createdAt: true,
    //             description: true,
    //             profile: {
    //                 select: {
    //                     aboutMe: true,
    //                     avatarId: true,
    //                     user: {
    //                         select: {
    //                             userName: true,
    //                         },
    //                     },
    //                 },
    //             },
    //             images: {
    //                 select: {
    //                     id: true,
    //                     url: true,
    //                     fileId: true,
    //                     order: true,
    //                 },
    //             },
    //         },
    //     })
    //
    //     // получение юзеров
    //     const usersCount = await this.prisma.user.count({
    //         where: {
    //             isDeleted: false,
    //         },
    //     })
    //
    //     //для корректного пути к фотографиям
    //     posts.forEach((post) => {
    //         if (post.profile.avatarId) {
    //             post.profile.avatarId = `${
    //                 Configuration.getConfiguration().YANDEX_S3_ENDPOINT
    //             }${post.profile.avatarId}`
    //         }
    //
    //         if (post.images && post.images.length > 0) {
    //             post.images = post.images.map((image) => ({
    //                 ...image,
    //                 url: `${
    //                     Configuration.getConfiguration().YANDEX_S3_ENDPOINT
    //                 }${image.url}`,
    //             }))
    //         }
    //     })
    //
    //     if (posts.length === 0) {
    //         return {
    //             items: [],
    //             usersCount: usersCount,
    //         }
    //     }
    //
    //     const mappedPosts: PostType[] = []
    //     posts.forEach((post) => {
    //         const tempPost: PostType = {
    //             id: post.id,
    //             createdAt: post.createdAt,
    //             aboutMe: post.profile.aboutMe,
    //             avatarId: post.profile.avatarId,
    //             username: post.profile.user.userName,
    //             description: post.description,
    //             postImages: post.images,
    //             //todo заглушка, т.к. не реализован функционал
    //             comments: [],
    //         }
    //         mappedPosts.push(tempPost)
    //     })
    //     return {
    //         items: mappedPosts,
    //         usersCount: usersCount,
    //     }
    // }

    async getPublicPosts(): Promise<ResultObject<PostViewModel> | null> {
        const LIMIT = 4

        const posts = await this.prisma.post.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            where: {
                deletedAt: null,
                isDraft: true,
            },
            take: LIMIT,
            include: {
                profile: {
                    select: {
                        avatarId: true,
                        user: {
                            select: {
                                id: true,
                                userName: true,
                            },
                        },
                    },
                },
                images: {
                    select: {
                        id: true,
                        url: true,
                    },
                },
            },
        })

        //для корректного пути к фотографиям
        posts.forEach((post) => {
            if (post.profile.avatarId) {
                post.profile.avatarId = `${
                    Configuration.getConfiguration().YANDEX_S3_ENDPOINT
                }${post.profile.avatarId}`
            }

            if (post.images && post.images.length > 0) {
                post.images = post.images.map((image) => ({
                    ...image,
                    url: `${
                        Configuration.getConfiguration().YANDEX_S3_ENDPOINT
                    }${image.url}`,
                }))
            }
        })

        const usersCount = await this.prisma.user.count({
            where: {
                isDeleted: false,
            },
        })

        if (posts.length === 0) {
            return {
                data: { items: [], usersCount: usersCount },
                resultCode: HttpStatus.OK,
                message: 'posts',
                field: 'posts',
            }
        }

        const mappedPosts: PaginatorPostItems[] = []
        posts.forEach((post) => {
            const tempPost: PaginatorPostItems = {
                postId: post.id,
                userId: post.profile.user.id,
                username: post.profile.user.userName,
                avatar_url: post.profile.avatarId,
                description: post.description,
                createdAt: post.createdAt.toISOString(),
                updatedAt: post.updatedAt.toISOString(),
                postImages: post.images,
                //todo заглушка, т.к. не реализован функционал
                comments: [],
            }
            mappedPosts.push(tempPost)
        })
        return {
            data: { items: mappedPosts, usersCount: usersCount },
            resultCode: HttpStatus.OK,
            message: 'posts',
            field: 'posts',
        }
    }
}
