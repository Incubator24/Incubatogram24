export abstract class IUserRepository {
    abstract findUserByLoginOrEmailWithEmailInfo(
        userName: string,
        email: string
    ): Promise<any>
    abstract findUserByLoginOrEmail(loginOrEmail: string): Promise<any | null>
    abstract deleteUserByUserId(userId: number)
}
