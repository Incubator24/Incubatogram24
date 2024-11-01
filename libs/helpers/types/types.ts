import { ApiProperty } from '@nestjs/swagger'

export type UserWithEmailViewModel = {
    id: number
    login: string
    email: string
    createdAt: Date
    passwordHash: string
    passwordSalt: string
    confirmationCode: string
    emailExpiration: Date
    isConfirmed: boolean
}
export type CreatedUserDto = {
    email: string
    userName: string
    passwordHash: string
    passwordSalt: string
    createdAt: string
    updatedAt: string
    isDeleted: boolean
}

export type CreatedUserWithGoogleProviderDto = {
    email: string
    userName: string
    createdAt: string
    updatedAt: string
    isDeleted: boolean
    googleId: string
    googleEmail: string
}

export type CreatedUserWithGithubProviderDto = {
    email: string
    userName: string
    createdAt: string
    updatedAt: string
    isDeleted: boolean
    githubId: number
    githubEmail: string
}

export type EmailExpirationRawType = {
    id: number
    confirmationCode: string
    emailExpiration: Date
    isConfirmed: boolean
    userId: number
}

type ProfileType = {
    firstName: string
    lastName: string
    dateOfBirth: string
    country: string
    city: string
    aboutMe: string
    url: string
}
export type ProfileViewModel = {
    id: number
    userName: string
    email: string
    emailIsConfirm: boolean
    createdAt: string
    updatedAt: string
    profile: ProfileType | null
    followingCount: number
    followersCount: number
    publicationsCount: number
}

export type CreatedEmailDto = {
    confirmationCode: string
    emailExpiration: Date
    isConfirmed: boolean
}

export type CreatedPassDto = {
    recoveryCode: string
    expirationAt: Date
}

export class PostImage {
    @ApiProperty()
    id: number
    @ApiProperty()
    url: string
    @ApiProperty()
    fileId: string
    @ApiProperty()
    order: number
}

export class PostType {
    @ApiProperty()
    id: number
    @ApiProperty()
    username: string
    @ApiProperty()
    avatarId: string
    @ApiProperty()
    aboutMe: string
    @ApiProperty()
    description: string
    @ApiProperty()
    createdAt: Date
    @ApiProperty({ type: [PostImage] })
    postImages: PostImage[]
    //todo здесь пустой массив с комментариями, пока заглушка, в будущем когда будет реализован функционал, то переделать
    @ApiProperty()
    comments: []
}

export class PublicPostType {
    @ApiProperty({ type: [PostType] })
    posts: PostType[]
}

export class PaginatorDto<T> {
    @ApiProperty()
    pagesCount: number
    @ApiProperty()
    page: number
    @ApiProperty()
    items: Array<T>
}

export class PaginatorDtoWithCountUsers<T> extends PaginatorDto<T> {
    @ApiProperty()
    usersCount: number
}
