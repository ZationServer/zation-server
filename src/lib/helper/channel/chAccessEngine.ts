/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/*
Class Description :
This class is to check the access for publish or subscribe channels.
It is used to check the access in the middleware or to check when the
token is changed.
 */

import Logger               = require('../logger/logger');
import ChTools              = require('./chTools');
import SmallBag             = require("../../api/SmallBag");
import {Socket}               from "../sc/socket";
import CIdChInfo             = require("../infoObjects/cIdChInfo");
import CChInfo               = require("../infoObjects/cChInfo");
import FuncTools             = require("../tools/funcTools");
import PubData               = require("../infoObjects/pubDataInfo");
import {ZationAccess, ZationChannel, ZationToken} from "../constants/internal";
import {AccessKey, ChConfigManager}               from "./chConfigManager";
import SocketInfo                                 from "../infoObjects/socketInfo";

export class ChAccessEngine
{
    private chConfigManager : ChConfigManager;
    private readonly smallBag : SmallBag;

    constructor(chConfigManager : ChConfigManager,smallBag : SmallBag) {
        this.chConfigManager = chConfigManager;
        this.smallBag = smallBag;
    }

    //Part Access
    private async hasAccessTo(value : any,socket : Socket,chName : string,{isPub, pubData},chId ?: string) : Promise<boolean>
    {
        let access = false;

        if(typeof value === 'boolean') {
            access = value;
        }
        else {
            let chInfo = {};
            if(!!chId) {
                chInfo = new CIdChInfo(chName,chId);
            }
            else {
                chInfo = new CChInfo(chName);
            }
            const socketInfo : SocketInfo = socket.socketInfo;

            if(typeof value === 'string')
            {
                if(value === ZationAccess.ALL) {
                    access = true;
                }
                else if(value === ZationAccess.ALL_AUTH) {
                    access = socketInfo.isAuthIn;
                }
                else if(value === ZationAccess.ALL_NOT_AUTH) {
                    access = !socketInfo.isAuthIn;
                }
                else if(socketInfo.authUserGroup === value) {
                    //GROUP!
                    access = true;
                }
            }
            else if(typeof value === 'function')
            {
                let res;
                if(isPub) {
                    res = await value(this.smallBag,chInfo,socketInfo,PubData.getFromBuild(pubData));
                }
                else {
                    res = await value(this.smallBag,chInfo,socketInfo);
                }

                if(typeof res === 'boolean') {
                    access = res;
                }
            }
            else if(Array.isArray(value)) {
                for(let i = 0; i < value.length; i++)
                {
                    if(typeof value[i] === 'string' && value[i] === socketInfo.authUserGroup) {
                        access = true;
                        break;
                    }
                    else if(typeof value[i] === 'number' && value[i] == socketInfo.userId) {
                        access = true;
                        break;
                    }
                }
            }
            else if(typeof value === 'number') {
                if(socketInfo.userId == value) {
                    access = true;
                }
            }
        }
        return access;
    }

    //Part CustomCh Access
    private async hasAccessToSub(socket : Socket,accessKey : number,accessValue : any,chName : string,chId ?: string) : Promise<boolean>
    {
        if(accessKey === AccessKey.ACCESS) {
            //normal
            return await this.hasAccessTo(accessValue,socket,chName,{isPub : false,pubData : {}},chId);
        }
        else if(accessKey === AccessKey.NOT_ACCESS) {
            //not
            return !(await this.hasAccessTo(accessValue,socket,chName,{isPub : false,pubData : {}},chId));
        }
        else {
            //default if no setting found!
            return false;
        }
    }

    private async hasAccessToPub(socket : Socket,accessKey : number,accessValue : any,pubData : any,chName : string,chId ?: string) : Promise<boolean>
    {
        if(accessKey === 1) {
            //normal
            return await this.hasAccessTo(accessValue,socket,chName,{isPub : true,pubData : pubData},chId);
        }
        else if(accessKey === 2) {
            //not
            return !(await this.hasAccessTo(accessValue,socket,chName,{isPub : true,pubData : pubData},chId));
        }
        else {
            //default if no setting found!
            return false;
        }
    }

    //Part Middleware Checks
    async checkAccessSubCustomIdCh(socket,trySubName : string) : Promise<any>
    {
        //return error
        const {name,id} = ChTools.getCustomIdChannelInfo(trySubName);

        if(name === undefined || name === '')
        {
            const err = new Error('You need an name, to sub an customIdChannel!');
            // @ts-ignore'
            err.code = 4592;
            return Error;
        }
        if(id === undefined || id === '')
        {
            const err = new Error('You need an id, to sub an customIdChannel!');
            // @ts-ignore'
            err.code = 4591;
            return Error;
        }

        if(!this.chConfigManager.isCustomIdCh(name))
        {
            const err = new Error('Unknown customIdChannel!');
            // @ts-ignore'
            err.code = 4593;
            Logger.printDebugInfo
            (`Socket with id: ${socket.id} try to subscribe an unknown customIdChannel. Name: '${name}',Id: '${id}'.`);
            return Error;
        }
        else
        {
            if(await (this.hasAccessToSub
            (
                socket,
                this.chConfigManager.getSubAccessKeyCustomIdCh(name),
                this.chConfigManager.getSubAccessValueCustomIdCh(name),
                name,
                id
            )))
            {
                Logger.printDebugInfo
                (`Socket with id: ${socket.id} subscribes customIdChannel. Name: '${name}',Id: '${id}'.`);
                return undefined;
            }
            else
            {
                const err = new Error(`Socket with id: ${socket.id}: access denied to subscribe customIdChannel. Name: '${name}',Id: '${id}'.`);
                // @ts-ignore'
                err.code = 4594;
                return err;
            }
        }
    }

    async checkAccessClientPubCustomIdCh(socket, tryPubName : string, pubData : any) : Promise<any>
    {
        //return error
        const {name,id} = ChTools.getCustomIdChannelInfo(tryPubName);

        if(name === undefined || name === '')
        {
            const err = new Error('You need an name, to pub in customIdChannel!');
            // @ts-ignore'
            err.code = 4595;
            return Error;
        }
        if(id === undefined || id === '')
        {
            const err = new Error('You need an id, to pub in customIdChannel!');
            // @ts-ignore'
            err.code = 4596;
            return Error;
        }

        if(!this.chConfigManager.isCustomIdCh(name))
        {
            const err = new Error('Unknown customIdChannel!');
            // @ts-ignore'
            err.code = 4597;
            Logger.printDebugInfo
            (`Socket with id: ${socket.id} try to publish in unknown customIdChannel. Name: '${name}',Id: '${id}'.`);
            return Error;
        }
        else
        {
            if(await (this.hasAccessToPub
            (
                socket,
                this.chConfigManager.getPubAccessKeyCustomIdCh(name),
                this.chConfigManager.getPubAccessValueCustomIdCh(name),
                pubData,
                name,
                id
            )))
            {
                //allOk
                const func = this.chConfigManager.getOnClientPubCustomIdCh(name);
                if(!!func) {
                    (async () => {
                        await FuncTools.emitEvent(func,this.smallBag,new CIdChInfo(name,id),new SocketInfo(socket),PubData.getFromBuild(pubData));
                    })();
                }

                Logger.printDebugInfo
                (`Socket with id: ${socket.id} publish in customIdChannel. Name: '${name}',Id: '${id}'.`);
                return undefined;
            }
            else
            {
                const err = new Error('No access to publish in this customIdChannel!');
                // @ts-ignore'
                err.code = 4598;
                return err;
            }
        }
    }
    async checkAccessSubCustomCh(socket,trySubName : string) : Promise<any>
    {
        //return error
        const name = ChTools.getCustomChannelName(trySubName);

        if(name === undefined || name === '')
        {
            const err = new Error('You need an name, to sub a customChannel!');
            // @ts-ignore'
            err.code = 4582;
            return Error;
        }

        if(!this.chConfigManager.isCustomCh(name))
        {
            const err = new Error('Unknown customChannel!');
            // @ts-ignore'
            err.code = 4583;
            Logger.printDebugInfo
            (`Socket with id: ${socket.id} try to subscribe an unknown customChannel. Name: '${name}'.`);
            return Error;
        }
        else
        {
            if(await (this.hasAccessToSub
            (
                socket,
                this.chConfigManager.getSubAccessKeyCustomCh(name),
                this.chConfigManager.getSubAccessValueCustomCh(name),
                name
            )))
            {
                Logger.printDebugInfo
                (`Socket with id: ${socket.id} subscribes a customChannel: '${name}'.`);
                return undefined;
            }
            else
            {
                const err = new Error(`Socket with id: ${socket.id}: access denied to subscribe a customChannel: '${name}'.`);
                // @ts-ignore'
                err.code = 4584;
                return err;
            }
        }
    }
    async checkAccessClientPubCustomCh(socket, tryPubName : string, pubData : any) : Promise<any>
    {
        //return error
        const name = ChTools.getCustomChannelName(tryPubName);

        if(name === undefined || name === '')
        {
            const err = new Error('You need an name, to pub in customChannel!');
            // @ts-ignore'
            err.code = 4585;
            return Error;
        }

        if(!this.chConfigManager.isCustomCh(name))
        {
            const err = new Error('Unknown customChannel!');
            // @ts-ignore'
            err.code = 4586;
            Logger.printDebugInfo
            (`Socket with id: ${socket.id} try to publish in an unknown customChannel. Name: '${name}'.`);
            return Error;
        }
        else
        {
            if((await this.hasAccessToPub
            (
                socket,
                this.chConfigManager.getPubAccessKeyCustomCh(name),
                this.chConfigManager.getPubAccessValueCustomCh(name),
                pubData,
                name
            )))
            {
                //allOk
                const func = this.chConfigManager.getOnClientPubCustomCh(name);
                if(!!func) {
                    (async () => {
                        await FuncTools.emitEvent(func,this.smallBag,new CChInfo(name),new SocketInfo(socket),PubData.getFromBuild(pubData));
                    })();
                }

                Logger.printDebugInfo
                (`Socket with id: ${socket.id} publish in a customChannel: '${name}'.`);
                return undefined;
            }
            else
            {
                const err = new Error('No access to publish in this customChannel!');
                // @ts-ignore'
                err.code = 4587;
                return err;
            }
        }

    }

    //Part Check Access auto
    //(When the token is changed)
    async checkSocketCustomChAccess(socket : Socket) : Promise<void>
    {
        if(socket !== undefined)
        {
            const subs = socket.subscriptions();

            for(let i = 0; i < subs.length; i++)
            {
                if(subs[i].indexOf(ZationChannel.CUSTOM_ID_CHANNEL_PREFIX) !== -1)
                {
                    //custom id channel
                    const {name,id} = ChTools.getCustomIdChannelInfo(subs[i]);
                    if(! (await this.hasAccessToSub
                    (
                        socket,
                        this.chConfigManager.getSubAccessKeyCustomIdCh(name),
                        this.chConfigManager.getSubAccessValueCustomIdCh(name),
                        name,
                        id
                    ))) {
                        ChTools.kickOut(socket,subs[i]);
                    }
                }
                else if(subs[i].indexOf(ZationChannel.CUSTOM_CHANNEL_PREFIX) !== -1)
                {
                    //custom channel

                    const name = ChTools.getCustomChannelName(subs[i]);
                    if(! (await this.hasAccessToSub
                    (
                        socket,
                        this.chConfigManager.getSubAccessKeyCustomCh(name),
                        this.chConfigManager.getSubAccessValueCustomCh(name),
                        name
                    ))) {
                        ChTools.kickOut(socket,subs[i]);
                    }
                }
            }
        }
    }

    static checkSocketZationChAccess(socket : Socket) : void
    {
        if(socket !== undefined)
        {
            // noinspection JSUnresolvedFunction
            const token : ZationToken | null = socket.getAuthToken();
            const subs = socket.subscriptions();

            let authUserGroup : undefined | string = undefined;
            let userId : undefined | number | string = undefined;
            let panelAccess : undefined | boolean = undefined;

            if(token !== null) {
                authUserGroup = token.zationAuthUserGroup;
                userId = token.zationUserId;
                panelAccess = token.zationPanelAccess;
            }

            for(let i = 0; i < subs.length; i++)
            {
                //Default group channel
                if(subs[i] === ZationChannel.DEFAULT_USER_GROUP
                    && authUserGroup !== ''
                    && authUserGroup !== undefined) {
                    ChTools.kickOut(socket,ZationChannel.DEFAULT_USER_GROUP);
                }
                //Auth GROUP
                else if(subs[i].indexOf(ZationChannel.AUTH_USER_GROUP_PREFIX) !== -1)
                {
                    const authGroupSub = subs[i].replace(ZationChannel.AUTH_USER_GROUP_PREFIX,'');
                    if(authUserGroup !== authGroupSub) {
                        ChTools.kickOut(socket,subs[i]);
                    }
                }
                //User Channel
                else if(subs[i].indexOf(ZationChannel.USER_CHANNEL_PREFIX) !== -1)
                {
                    const userIdSub = subs[i].replace(ZationChannel.USER_CHANNEL_PREFIX,'');
                    if(userId != userIdSub) {
                        ChTools.kickOut(socket,subs[i]);
                    }
                }
                //Panel Channel
                else if(subs[i] === ZationChannel.PANEL_OUT && !panelAccess) {
                    ChTools.kickOut(socket,subs[i]);
                }

            }
        }
    }

}
