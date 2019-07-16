/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export default interface JwtSignOptions extends Record<string,any> {
    expiresIn ?: number;
    notBefore ?: number;
    algorithm ?: string;
}

export default interface JwtVerifyOptions extends Record<string,any> {
    algorithms ?: string[];
    maxAge ?: string | number;
    ignoreExpiration ?: boolean;
}