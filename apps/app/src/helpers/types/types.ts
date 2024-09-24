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
    githubId: string
    githubEmail: string
}

export type EmailExpirationRawType = {
    id: number
    confirmationCode: string
    emailExpiration: Date
    isConfirmed: boolean
    userId: number
}
