import { EmailExpiration, Profile, User } from '@prisma/client'
import { add } from 'date-fns'

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

type ProfileType = {
    firstName: string
    lastName: string
    dateOfBirth: string
    country: string
    city: string
    aboutMe: string
    avatarId: string
}
export type ProfileViewModel = {
    id: number
    userName: string
    email: string
    emailIsConfirm: boolean
    createdAt: string
    updatedAt: string
    profile: ProfileType | null
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
