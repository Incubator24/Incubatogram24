class Configuration {
    private static readEnvVariableWithDefault(
        variable: string,
        defaultValue: any
    ) {
        return process.env[variable] || defaultValue
    }

    private static getPort(): number {
        return Number(this.readEnvVariableWithDefault('PORT', 3002))
    }
    private static getCity(): string {
        return String(this.readEnvVariableWithDefault('CITY', 'Moscow'))
    }
    private static getUrl(): string {
        return String(
            this.readEnvVariableWithDefault('DATABASE_URL', 'Database')
        )
    }
    private static getPassworSalt(): number {
        return Number(this.readEnvVariableWithDefault('10', 10))
    }

    static getConfiguration() {
        return {
            PORT: Configuration.getPort(),
            CITY: Configuration.getCity(),
            DATABASE_URL: Configuration.getUrl(),
            PASSWORD_SALT: Configuration.getPassworSalt(),
        }
    }
}
export type ConfigType = ReturnType<typeof Configuration.getConfiguration>

export default Configuration
