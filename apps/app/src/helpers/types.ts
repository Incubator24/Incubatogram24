export type UserWithEmailViewModel = {
    id: number
    login: string
    email: string
    createdAt: Date
    passwordSalt: string
    passwordHash: string
    confirmationCode: string
    emailExpiration: string
    isConfirmed: boolean
}
