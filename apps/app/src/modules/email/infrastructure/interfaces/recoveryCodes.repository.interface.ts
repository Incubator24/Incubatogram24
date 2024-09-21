export abstract class IRecoveryCodesRepository {
    abstract createDataForRecoveryCode(
        email: string,
        code: string
    ): Promise<string | boolean>
    abstract updateDataForRecoveryCode(
        email: string,
        code: string
    ): Promise<string | boolean>
    abstract findDataByRecoveryCode(code: string): Promise<any | null>
}
