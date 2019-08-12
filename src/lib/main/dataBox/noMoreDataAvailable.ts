/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ErrorName} from "../constants/errorName";

export default class NoMoreDataAvailableError extends Error
{
    constructor() {
        super();
        this.name = ErrorName.NO_MORE_DATA_AVAILABLE;
    }
}