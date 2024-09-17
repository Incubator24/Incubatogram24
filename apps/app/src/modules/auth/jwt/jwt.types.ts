export type UserAndDeviceTypeFromRefreshToken = {
    userId: number
    deviceId: string
    iat: number
    exp: number
}
export type LoginSuccessViewModel = {
    accessToken: string
}
export type LoginSuccessViewModelForRefresh = {
    refreshToken: string
}
