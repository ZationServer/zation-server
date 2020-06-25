/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ClientErrorName} from "../definitions/clientErrorName";

export default class NoMoreDataAvailableError extends Error
{
    constructor() {
        super();
        this.name = ClientErrorName.NoMoreDataAvailable;
    }
}