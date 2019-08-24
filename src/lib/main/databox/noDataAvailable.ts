/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ClientErrorName} from "../constants/clientErrorName";

export default class NoDataAvailableError extends Error
{
    private readonly _code ?: number | string;
    private readonly _data ?: any;

    constructor(code ?: string | number,data ?: any) {
        super();
        this.name = ClientErrorName.NO_MORE_DATA_AVAILABLE;
        this._code = code;
        this._data = data;
    }

    /**
     * Returns the code.
     */
    get code(): number | string | undefined {
        return this._code;
    }

    /**
     * Returns the data.
     */
    get data(): any {
        return this._data;
    }
}