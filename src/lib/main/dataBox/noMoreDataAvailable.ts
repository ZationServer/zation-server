/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ClientErrorName} from "../constants/clientErrorName";

export default class NoMoreDataAvailableError extends Error
{
    constructor() {
        super();
        this.name = ClientErrorName.NO_MORE_DATA_AVAILABLE;
    }
}