/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class ErrorTypes {}

//Zation
ErrorTypes.SYSTEM_ERROR         = 'SYSTEM_ERROR';           //Client cant handle
ErrorTypes.INPUT_ERROR          = 'INPUT_ERROR';            //Client cant handle
ErrorTypes.VALIDATOR_ERROR      = 'VALIDATOR_ERROR';        //Client can  handle
ErrorTypes.AUTH_ERROR           = 'AUTH_ERROR';             //Client can  handle
ErrorTypes.PROTOCOL_ERROR       = 'PROTOCOL_ERROR';         //Client can  handle
ErrorTypes.TOKEN_ERROR          = 'TOKEN_ERROR';            //Client can  handle
ErrorTypes.DATABASE_ERROR       = 'DATABASE_ERROR';         //Client cant handle
ErrorTypes.COMPATIBILITY_ERROR  = 'COMPATIBILITY_ERROR';    //Client can  handle
ErrorTypes.REACT                = 'REACT';                  //Client muss  handle

//User
ErrorTypes.NORMAL_ERROR         = 'NORMAL_ERROR';


module.exports = ErrorTypes;