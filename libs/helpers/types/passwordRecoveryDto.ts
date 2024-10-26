export type PasswordRecoveryDto = {
    recoveryCode: string
    expirationAt: Date
}

export type UpdatePasswordDto = {
    passwordSalt: string
    passwordHash: string
}
