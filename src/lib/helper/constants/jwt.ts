/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export default interface JwtSignOptions extends Record<string,any> {
    expiresIn ?: number,
    notBefore ?: number
    algorithm ?: string
}

