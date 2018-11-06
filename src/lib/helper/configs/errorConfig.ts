/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export type ErrorConfig = Record<string,ErrorConstruct>;

export interface ErrorConstruct
{
    name ?: string;
    group ?: string;
    description ?: string;
    type ?: string;
    sendInfo ?: boolean;
    private  ?: boolean;
    fromZationSystem  ?: boolean;
}