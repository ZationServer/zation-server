/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

let ErrorType = require('../constante/errorTypes');

module.exports = {

    clientAuthAgain: {
        name: 'clientAuthOut',
        description: 'The client should auth out!',
        type: ErrorType.REACT,
        sendInfo: false,
        isSystemError: false
    }
};