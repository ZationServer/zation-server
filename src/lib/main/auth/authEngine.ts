/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationWorker        = require("../../core/zationWorker");
import {PrepareZationToken, RawZationToken} from "../constants/internal";
import AEPreparedPart       from "./aePreparedPart";
import AuthenticationError  from "../error/authenticationError";
import TokenUtils           from "../token/tokenUtils";
import {JwtSignOptions}     from "../constants/jwt";
// noinspection ES6PreferShortImport
import {RawSocket}          from '../sc/socket';

export default class AuthEngine
{
    protected readonly aePreparedPart: AEPreparedPart;
    public readonly socket: RawSocket;
    protected readonly worker: ZationWorker;
    protected readonly tokenClusterKey: string;

    protected currentDefault: boolean;
    protected currentUserGroup: string | undefined;
    protected currentUserId: string | number | undefined;

    constructor(socket: RawSocket, worker: ZationWorker)
    {
        this.aePreparedPart = worker.getAEPreparedPart();
        this.socket         = socket;
        this.worker         = worker;
        this.tokenClusterKey  = worker.getZationConfig().internalData.tokenClusterKey;

        this.currentDefault   = true;
        this.currentUserGroup = this.aePreparedPart.getDefaultGroup();
        this.currentUserId    = undefined;
    }

    /**
     * Load the information from token in the memory of the auth engine.
     */
    refresh(token: null | RawZationToken): void {
        if(token !== null) {
            this.currentUserId = token.userId;
            this.currentUserGroup = token.authUserGroup;
            this.currentDefault = false;
        }
        else {
            this.currentDefault = true;
            this.currentUserGroup = this.aePreparedPart.getDefaultGroup();
        }
    }

    isAuth(): boolean {
        return !(this.isDefault());
    }

    isDefault(): boolean {
        return this.currentDefault;
    }

    getUserGroup(): string | undefined {
        return this.currentUserGroup;
    }

    getAuthUserGroup(): string | undefined {
        return this.isDefault() ? undefined: this.currentUserGroup;
    }

    getUserId(): number | string | undefined {
        return this.currentUserId;
    }

    async authenticate(authUserGroup: string, userId?: string | number,tokenVariables: object = {},jwtOptions: JwtSignOptions = {}): Promise<void>
    {
        if(this.checkIsIn(authUserGroup)) {

            const token: PrepareZationToken =
                this.socket.authToken !== null ?
                {}: TokenUtils.generateToken(this.tokenClusterKey);

            token.authUserGroup = authUserGroup;
            token.variables = tokenVariables;

            if(userId !== undefined) {
                token.userId = userId;
            }
            //check auto panelAccess
            if(this.aePreparedPart.authUserGroupPanelAccess(authUserGroup)) {
                token.panelAccess = true;
            }

            await TokenUtils.setTokenAsync(this.socket,TokenUtils.combineTokens(this.socket.authToken,token),jwtOptions);
        }
        else {
            throw new AuthenticationError(`Auth group '${authUserGroup}' is not found in the app.config.`);
        }
    }

    async setPanelAccess(access: boolean): Promise<void>
    {
        let token = this.socket.authToken;
        if(token !== null) {
            token = {...token};
            token.panelAccess = access;
            await TokenUtils.setTokenAsync(this.socket,token);
        }
        else {
            throw new AuthenticationError(`Panel access can not be updated if the socket is unauthenticated!`);
        }
    }

    hasPanelAccess(): boolean {
        const token = this.socket.authToken;
        if(token !== null && typeof token.panelAccess === 'boolean'){
            return token.panelAccess;
        }
        return false;
    }

    async setUserId(userId: number | string | undefined): Promise<void> {
        let token = this.socket.authToken;
        if(token !== null) {
            token = {...token};
            token.userId = userId;
            await TokenUtils.setTokenAsync(this.socket,token);
        }
        else {
            throw new AuthenticationError(`User id can not be updated if the socket is unauthenticated!`);
        }
    }

    async removeUserId(): Promise<void> {
       await this.setUserId(undefined);
    }

    async deauthenticate(): Promise <void> {
        if(this.isAuth()) {
            this.socket.deauthenticate();
        }
    }

    // noinspection JSUnusedGlobalSymbols
    getDefaultGroup(): string {
        return this.aePreparedPart.getDefaultGroup();
    }

    checkIsIn(authGroup: string): boolean {
        return this.aePreparedPart.isAuthGroup(authGroup);
    }

    getWorker(): ZationWorker {
        return this.worker;
    }
}

