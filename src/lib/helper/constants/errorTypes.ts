/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class ErrorTypes {
    //Zation
    static readonly SYSTEM_ERROR         = 'SYSTEM_ERROR';           //Client cant handle
    static readonly INPUT_ERROR          = 'INPUT_ERROR';            //Client cant handle
    static readonly VALIDATION_ERROR     = 'VALIDATION_ERROR';       //Client can  handle
    static readonly AUTH_ERROR           = 'AUTH_ERROR';             //Client can  handle
    static readonly PROTOCOL_ERROR       = 'PROTOCOL_ERROR';         //Client can  handle
    static readonly TOKEN_ERROR          = 'TOKEN_ERROR';            //Client can  handle
    static readonly DATABASE_ERROR       = 'DATABASE_ERROR';         //Client cant handle
    static readonly COMPATIBILITY_ERROR  = 'COMPATIBILITY_ERROR';    //Client can  handle
    static readonly TIME_ERROR           = 'TIME_ERROR';             //Client wait..
    static readonly CODE_ERROR           = 'CODE_ERROR';
    //User
    static readonly NORMAL_ERROR         = 'NORMAL_ERROR';
}

export = ErrorTypes;