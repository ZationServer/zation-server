/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {RawZationToken}  from "../definitions/internal";
import CloneUtils        from '../utils/cloneUtils';
import {DeepReadonly}    from 'ts-essentials';

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
    getTokenPayload(): DeepReadonly<Partial<TP>> {
        return (this._token.payload || {}) as DeepReadonly<Partial<TP>>;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns a deep clone of the token payload.
     */
    getTokenPayloadClone(): Partial<TP> {
        const payload = this._token.payload;
        return payload ? CloneUtils.deepClone(payload) : {};
    }
}