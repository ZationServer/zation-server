/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export interface JwtSignOptions extends Record<string,any> {
    expiresIn?: number;
    notBefore?: number;
    algorithm?: string;
}

export interface JwtVerifyOptions extends Record<string,any> {
    algorithms?: string[];
    maxAge?: string | number;
    ignoreExpiration?: boolean;
}

export type JwtSignFunction = (token: any,key: string,options: JwtVerifyOptions,callback: (err:any,token:string)=>void) => void;
export type JwtVerifyFunction = (token: string,key: string,options: JwtSignOptions,callback: (err:any,token:any)=>void) => void;