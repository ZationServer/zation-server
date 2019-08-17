/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const  encrypter         = require("object-encrypter");

export default class Encoder
{
    private engine : any;

    constructor(secretKey : string)
    {
        this.engine = encrypter(secretKey);
    }

    encrypt(obj : object) : string
    {
        return this.engine.encrypt(obj);
    }

    decrypt(code : string) : object
    {
        return this.engine.decrypt(code);
    }
}

