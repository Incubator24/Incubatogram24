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
