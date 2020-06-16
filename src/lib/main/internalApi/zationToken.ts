/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {RawZationToken}  from "../constants/internal";
import CloneUtils        from '../utils/cloneUtils';

export default class ZationToken<TP extends object = any>
{
    private readonly _token: RawZationToken;

    constructor(token: RawZationToken) {
        this._token = token;
    }

    // noinspection JSUnusedGlobalSymbols
    get userId(): number | string | undefined {
        return this._token.userId;
    }

    // noinspection JSUnusedGlobalSymbols
    get authUserGroup(): string | undefined {
        return this._token.authUserGroup;
    }

    // noinspection JSUnusedGlobalSymbols
    get tokenId(): string {
        return this._token.tid;
    }

    // noinspection JSUnusedGlobalSymbols
    get expire(): number {
        return this._token.exp;
    }

    // noinspection JSUnusedGlobalSymbols
    get panelAccess(): boolean {
        return !!this._token.panelAccess;
    }

    // noinspection JSUnusedGlobalSymbols
    get rawToken(): RawZationToken {
        return this._token;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the token payload.
     */
    getTokenPayload(): Partial<TP> {
        return CloneUtils.deepClone(this._token.payload!);
    }

}