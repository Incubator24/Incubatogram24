import * as dotenv from 'dotenv'
import { Transport } from '@nestjs/microservices'
import { ClientOptions } from '@nestjs/microservices/interfaces/client-metadata.interface'

class Configuration {
    private static loadEnv() {
        const environment = [
            'development',
            'test',
            'production',
            'staging',
        ].includes(process.env.NODE_ENV)
            ? process.env.NODE_ENV
            : ''

        const envFilePath = environment ? ['.env', `.env.${environment}`] : ''
        dotenv.config({ path: envFilePath, override: true })
    }

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
        const city = this.readEnvVariableWithDefault('CITY', 'Moscow')
        return String(city)
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

    private static getGithubClientId(): string {
        return String(
            this.readEnvVariableWithDefault('GITHUB_CLIENT_ID', '123')
        )
    }

    private static getGithubClientSecret(): string {
        return String(
            this.readEnvVariableWithDefault('GITHUB_CLIENT_SECRET', '123')
        )
    }

    private static getGithubCallbackUrl(): string {
        return String(
            this.readEnvVariableWithDefault(
                'GITHUB_CALLBACK_URL',
                'http://localhost:3000/auth/github-success'
            )
        )
    }

    private static getGoogleClientId(): string {
        return String(
            this.readEnvVariableWithDefault('GOOGLE_CLIENT_ID', '123')
        )
    }

    private static getGoogleClientSecret(): string {
        return String(
            this.readEnvVariableWithDefault('GOOGLE_CLIENT_SECRET', '123')
        )
    }

    private static getGoogleCallbackUrl(): string {
        return String(
            this.readEnvVariableWithDefault(
                'GOOGLE_CALLBACK_URL',
                'http://localhost:3000/auth/google-success'
            )
        )
    }

    private static getBackUrl(): string {
        return String(
            this.readEnvVariableWithDefault(
                'BACK_URL',
                'https://app.incubatogram.org/api/v1/'
            )
        )
    }

    private static getFrontUrl(): string {
        return String(
            this.readEnvVariableWithDefault(
                'FRONT_URL',
                'https://incubatogram.org/'
            )
        )
    }

    private static getYandexS3KeyId(): string {
        return String(
            this.readEnvVariableWithDefault('YANDEX_S3_KEY_ID', 'yandex key id')
        )
    }

    private static getYandexS3SecretKey(): string {
        return String(
            this.readEnvVariableWithDefault(
                'YANDEX_S3_SECRET_KEY',
                'yandex secret key'
            )
        )
    }

    private static getYandexS3BucketName(): string {
        return String(
            this.readEnvVariableWithDefault(
                'YANDEX_S3_BUCKET_NAME',
                'yandex secret key'
            )
        )
    }

    private static getYandexS3Endpoint(): string {
        return String(
            this.readEnvVariableWithDefault(
                'YANDEX_S3_ENDPOINT',
                'yandex endpoint'
            )
        )
    }

    private static getYandexS3EndpointWithBucket(): string {
        return String(
            this.readEnvVariableWithDefault(
                'YANDEX_S3_ENDPOINT_WITH_BUCKET',
                'yandex endpoint with bucket'
            )
        )
    }

    private static getAuthService(): ClientOptions {
        return {
            options: {
                // host: this.readEnvVariableWithDefault(
                //     'AUTH_SERVICE_HOST',
                //     'micro-auth-service'
                // ),
                host: 'micro-auth-service',
                port: Number(
                    this.readEnvVariableWithDefault('AUTH_SERVICE_PORT', '3594')
                ),
            },
            transport: Transport.TCP,
        }
    }

    private static getAuthServiceHost(): string {
        return String(
            this.readEnvVariableWithDefault('AUTH_SERVICE_HOST', '0.0.0.0')
        )
    }

    private static getAuthServicePort(): number {
        return Number(
            this.readEnvVariableWithDefault('AUTH_SERVICE_PORT', '3594')
        )
    }

    static getConfiguration() {
        Configuration.loadEnv()
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
            GITHUB_CLIENT_ID: Configuration.getGithubClientId(),
            GITHUB_CLIENT_SECRET: Configuration.getGithubClientSecret(),
            GITHUB_CALLBACK_URL: Configuration.getGithubCallbackUrl(),
            GOOGLE_CLIENT_SECRET: Configuration.getGoogleClientSecret(),
            GOOGLE_CLIENT_ID: Configuration.getGoogleClientId(),
            GOOGLE_CALLBACK_URL: Configuration.getGoogleCallbackUrl(),
            FRONT_URL: Configuration.getFrontUrl(),
            BACK_URL: Configuration.getBackUrl(),
            YANDEX_S3_KEY_ID: Configuration.getYandexS3KeyId(),
            YANDEX_S3_SECRET_KEY: Configuration.getYandexS3SecretKey(),
            YANDEX_S3_BUCKET_NAME: Configuration.getYandexS3BucketName(),
            YANDEX_S3_ENDPOINT: Configuration.getYandexS3Endpoint(),
            YANDEX_S3_ENDPOINT_WITH_BUCKET:
                Configuration.getYandexS3EndpointWithBucket(),
            AUTH_SERVICE: Configuration.getAuthService(),
            AUTH_SERVICE_HOST: Configuration.getAuthServiceHost(),
            AUTH_SERVICE_PORT: Configuration.getAuthServicePort(),
        }
    }
}

export type ConfigType = ReturnType<typeof Configuration.getConfiguration>

export default Configuration
