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
        return String(this.readEnvVariableWithDefault('CITY', 'Syktyvkar'))
    }
    private static getUrl(): string {
        return String(
            this.readEnvVariableWithDefault('DATABASE_URL', 'Database')
        )
    }

    static getConfiguration() {
        return {
            PORT: Configuration.getPort(),
            CITY: Configuration.getCity(),
            DATABASE_URL: Configuration.getUrl(),
        }
    }
}
export type ConfigType = ReturnType<typeof Configuration.getConfiguration>

export default Configuration
