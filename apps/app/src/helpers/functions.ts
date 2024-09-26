import { add } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import { CreatedEmailDto, CreatedPassDto } from './types/types'

export const isOlderThan13 = (dateOfBirthString: string): boolean => {
    const dateOfBirth = new Date(dateOfBirthString)
    const today = new Date()

    // Получаем разницу в миллисекундах
    const ageInMilliseconds = today.getTime() - dateOfBirth.getTime()

    // Переводим миллисекунды в годы (1 год = 1000 * 60 * 60 * 24 * 365.25)
    const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25)
    console.log(ageInYears)

    return ageInYears > 13
}

export function createEmailDto(isConfirmed: boolean): CreatedEmailDto {
    return {
        confirmationCode: uuidv4(),
        emailExpiration: add(new Date(), {
            hours: 24,
            minutes: 3,
        }),
        isConfirmed: isConfirmed,
    }
}

export function createPassDto(): CreatedPassDto {
    return {
        recoveryCode: uuidv4(),
        expirationAt: add(new Date(), {
            hours: 24,
            minutes: 3,
        }),
    }
}
