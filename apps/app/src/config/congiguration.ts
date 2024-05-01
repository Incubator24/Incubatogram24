class Configuration {
    private static readEnvVariableWithDefault(
        variable: string,
        defaultValue: any
    ) {
        return process.env[variable] || defaultValue
    }

    private static getPort(): number {
        return Number(this.readEnvVariableWithDefault('PORT', 5978))
    }
    private static getCity(): string {
        return String(this.readEnvVariableWithDefault('CITY', 'Moscow'))
    }

    static getConfiguration() {
        return {
            PORT: Configuration.getPort(),
            CITY: Configuration.getCity(),
        }
    }
}
export type ConfigType = ReturnType<typeof Configuration.getConfiguration>

export default Configuration
