/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export const enum WorkerChMapTaskActions
{
    DISCONNECT,
    DEAUTHENTICATE,
    KICK_OUT,
    EMIT
}

export const enum WorkerChSpecialTaskActions
{
    UPDATE_USER_TOKENS,
    UPDATE_GROUP_TOKENS,
    MESSAGE
}