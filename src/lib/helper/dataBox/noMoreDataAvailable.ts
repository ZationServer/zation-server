/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ErrorName} from "../constants/errorName";

export default class NoMoreDataAvailableError extends Error
{
    constructor() {
        super();
        this.name = ErrorName.NO_MORE_DATA_AVAILABLE;
    }
}