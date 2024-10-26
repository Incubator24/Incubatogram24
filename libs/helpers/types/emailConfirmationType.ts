export type EmailConfirmationType = {
    confirmationCode: string
    emailExpiration: Date
    isConfirmed: boolean
}

export type EmailExpirationDto = {
    confirmationCode: string
    emailExpiration: Date
}
