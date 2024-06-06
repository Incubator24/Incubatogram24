class Configuration {
    private static readEnvVariableWithDefault(
        variable: string,
        defaultValue: any
    ) {
        return process.env[variable] || defaultValue
    }

    private static getPort(): number {
        return Number(this.readEnvVariableWithDefault('PORT', 3001))
    }

    private static getCity(): string {
        return String(this.readEnvVariableWithDefault('CITY', 'Moscow'))
    }

    private static getUrl(): string {
        return String(
            this.readEnvVariableWithDefault('DATABASE_URL', 'Database')
        )
    }

    private static getPasswordSalt(): number {
        return Number(this.readEnvVariableWithDefault('PASSWORD_SALT', 10))
    }

    private static getJwtSecret(): string {
        return String(this.readEnvVariableWithDefault('JWT_SECRET', '123456'))
    }

    private static getSecretKey(): string {
        return String(this.readEnvVariableWithDefault('SECRET_KEY', '123456'))
    }

    private static getAccessJwtLifetime(): string {
        return String(
            this.readEnvVariableWithDefault('ACCESS_JWT_LIFETIME', '10h')
        )
    }

    private static getRefreshJwtLifetime(): string {
        return String(
            this.readEnvVariableWithDefault('REFRESH_JWT_LIFETIME', '20h')
        )
    }

    private static getHttpBasicUser(): string {
        return String(
            this.readEnvVariableWithDefault('HTTP_BASIC_USER', 'admin')
        )
    }
    private static getEmailServiceUser(): string {
        return String(
            this.readEnvVariableWithDefault(
                'EMAIL_SERVICE_USER',
                'incubator2404@gmail.com'
            )
        )
    }
    private static getEmailServicePasswordUser(): string {
        return String(
            this.readEnvVariableWithDefault(
                'EMAIL_SERVICE_PASSWORD_USER',
                'kzwougluujijgrmm'
            )
        )
    }

    private static getHttpBasicPass(): string {
        return String(
            this.readEnvVariableWithDefault('HTTP_BASIC_PASS', '123456')
        )
    }
    private static getRecaptchaPublicKey(): string {
        return String(
            this.readEnvVariableWithDefault(
                'RECAPCHA_PUBLIK_KEY',
                '6LcHa_IpAAAAAHtV6uwC9bUDjnF3UXvWP256VQXR'
            )
        )
    }

    private static getRecaptchaPrivateKey(): string {
        return String(
            this.readEnvVariableWithDefault(
                'RECAPCHA_PRIVATE_KEY',
                '6LcHa_IpAAAAAJ8GVbnesouqGGnvZp8dJgrcB2K1'
            )
        )
    }

    static getConfiguration() {
        return {
            PORT: Configuration.getPort(),
            CITY: Configuration.getCity(),
            DATABASE_URL: Configuration.getUrl(),
            PASSWORD_SALT: Configuration.getPasswordSalt(),
            JWT_SECRET: Configuration.getJwtSecret(),
            SECRET_KEY: Configuration.getSecretKey(),
            ACCESS_JWT_LIFETIME: Configuration.getAccessJwtLifetime(),
            REFRESH_JWT_LIFETIME: Configuration.getRefreshJwtLifetime(),
            HTTP_BASIC_USER: Configuration.getHttpBasicUser(),
            HTTP_BASIC_PASS: Configuration.getHttpBasicPass(),
            EMAIL_SERVICE_USER: Configuration.getEmailServiceUser(),
            EMAIL_SERVICE_PASSWORD_USER:
                Configuration.getEmailServicePasswordUser(),
            RECAPTCHA_PUBLIC_KEY: Configuration.getRecaptchaPublicKey(),
            RECAPTCHA_PRIVATE_KEY: Configuration.getRecaptchaPrivateKey(),
        }
    }
}

export type ConfigType = ReturnType<typeof Configuration.getConfiguration>

export default Configuration
