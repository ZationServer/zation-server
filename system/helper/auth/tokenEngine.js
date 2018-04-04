/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Jwt           = require('jsonwebtoken');
const Const         = require('../constante/constWrapper');
const TaskError     = require('../../api/TaskError');
const SyErrors      = require('../zationTaskErrors/systemTaskErrors');

class TokenEngine
{
    constructor(exchange)
    {
        this._exchange = exchange;
    }

    registerToken(token)
    {




    }

    changedToken(oldToken,newToken)
    {




    }


}

module.exports = TokenEngine;