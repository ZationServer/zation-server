/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ErrorType = require('../constants/errorTypes');

export = {

    clientAuthAgain: {
        name: 'clientAuthOut',
        description: 'The client should auth out!',
        type: ErrorType.REACT,
        sendInfo: false,
        isFromZationSystem : true
    }
};