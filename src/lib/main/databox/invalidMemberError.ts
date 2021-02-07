/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ClientErrorName} from "../definitions/clientErrorName";

export default class InvalidMemberError extends Error
{
    private readonly info: {code?: string |number,data?: any} = {};

    constructor(code?: string | number,data?: any) {
        super();
        this.name = ClientErrorName.InvalidMember;
        this.info.code = code;
        this.info.data = data;
    }

    /**
     * Returns the code.
     */
    get code(): number | string | undefined {
        return this.info.code;
    }

    /**
     * Returns the data.
     */
    get data(): any {
        return this.info.data;
    }
}