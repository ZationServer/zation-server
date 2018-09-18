/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

/*
Class Description :
This class is to check the protocolAccess for publish or subscribe channels.
It is used to check the protocolAccess in the middleware or to check when the
token is changed.
 */
import Const                = require('../constants/constWrapper');
import Logger               = require('../logger/logger');
import ChTools              = require('./chTools');
import SmallBag             = require("../../api/SmallBag");
import ChConfigManager      = require("./chConfigManager");
import {Socket}               from "../sc/socket";
import CIdChInfo             = require("../infoObjects/cIdChInfo");
import CChInfo               = require("../infoObjects/cChInfo");
import SocketInfo            = require("../infoObjects/socketInfo");
import FuncTools             = require("../tools/funcTools");

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
            const socketInfo : SocketInfo = new SocketInfo(socket);

            if(typeof value === 'string')
            {
                if(value === Const.Channel.ACCESS.ALL) {
                    access = true;
                }
                else if(value === Const.Channel.ACCESS.ALL_AUTH) {
                    access = socketInfo.isAuthIn;
                }
                else if(value === Const.Channel.ACCESS.ALL_NOT_AUTH) {
                    access = !socketInfo.isAuthIn;
                }
                else if(socketInfo.authUserGroup === value) {
                    //Group!
                    access = true;
                }
            }
            else if(typeof value === 'function')
            {
                let res;
                if(isPub) {
                    res = await value(this.smallBag,chInfo,socketInfo,pubData);
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
                    else if(typeof value[i] === 'number' && value[i] === socketInfo.userId) {
                        access = true;
                        break;
                    }
                }
            }
            else if(typeof value === 'number') {
                if(socketInfo.userId === value) {
                    access = true;
                }
            }
        }
        return access;
    }

    //Part CustomCh Access
    private async hasAccessToSub(socket : Socket,accessKey : number,accessValue : any,chName : string,chId ?: string) : Promise<boolean>
    {
        if(accessKey === 1) {
            //normal
            return await this.hasAccessTo(accessValue,socket,chName,{isPub : false,pubData : {}},chId);
        }
        else if(accessKey === 2) {
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
            let err = new Error('You need an name, to sub an customIdChannel!');
            // @ts-ignore'
            err.code = 4592;
            return Error;
        }
        if(id === undefined || id === '')
        {
            let err = new Error('You need an id, to sub an customIdChannel!');
            // @ts-ignore'
            err.code = 4591;
            return Error;
        }

        if(!this.chConfigManager.isCustomIdCh(name))
        {
            let err = new Error('Unknown customIdChannel!');
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
                let err = new Error('No protocolAccess to sub this customIdChannel!');
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
            let err = new Error('You need an name, to pub in customIdChannel!');
            // @ts-ignore'
            err.code = 4595;
            return Error;
        }
        if(id === undefined || id === '')
        {
            let err = new Error('You need an id, to pub in customIdChannel!');
            // @ts-ignore'
            err.code = 4596;
            return Error;
        }

        if(!this.chConfigManager.isCustomIdCh(name))
        {
            let err = new Error('Unknown customIdChannel!');
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
                let func = this.chConfigManager.getOnClientPubCustomIdCh(name);
                if(!!func) {
                    (async () => {
                        await FuncTools.emitEvent(func,this.smallBag,new CIdChInfo(name,id),new SocketInfo(socket),pubData);
                    })();
                }

                Logger.printDebugInfo
                (`Socket with id: ${socket.id} publish in customIdChannel. Name: '${name}',Id: '${id}'.`);
                return undefined;
            }
            else
            {
                let err = new Error('No protocolAccess to publish in this customIdChannel!');
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
            let err = new Error('You need an name, to sub a customChannel!');
            // @ts-ignore'
            err.code = 4582;
            return Error;
        }

        if(!this.chConfigManager.isCustomCh(name))
        {
            let err = new Error('Unknown customChannel!');
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
                let err = new Error('No protocolAccess to subscribe this customChannel!');
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
            let err = new Error('You need an name, to pub in customChannel!');
            // @ts-ignore'
            err.code = 4585;
            return Error;
        }

        if(!this.chConfigManager.isCustomCh(name))
        {
            let err = new Error('Unknown customChannel!');
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
                let func = this.chConfigManager.getOnClientPubCustomCh(name);
                if(!!func) {
                    (async () => {
                        await FuncTools.emitEvent(func,this.smallBag,new CChInfo(name),new SocketInfo(socket),pubData);
                    })();
                }

                Logger.printDebugInfo
                (`Socket with id: ${socket.id} publish in a customChannel: '${name}'.`);
                return undefined;
            }
            else
            {
                let err = new Error('No protocolAccess to publish in this customChannel!');
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
            let subs = socket.subscriptions();

            for(let i = 0; i < subs.length; i++)
            {
                if(subs[i].indexOf(Const.Settings.CHANNEL.CUSTOM_ID_CHANNEL_PREFIX) !== -1)
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
                else if(subs[i].indexOf(Const.Settings.CHANNEL.CUSTOM_CHANNEL_PREFIX) !== -1)
                {
                    //custom channel

                    let name = ChTools.getCustomChannelName(subs[i]);
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
            const token = socket.getAuthToken();
            const subs = socket.subscriptions();

            let authUserGroup = undefined;
            let userId = undefined;
            let panelAccess = undefined;

            if(token !== undefined && token !== null)
            {
                authUserGroup = token[Const.Settings.TOKEN.AUTH_USER_GROUP];
                userId = token[Const.Settings.TOKEN.USER_ID];
                panelAccess = token[Const.Settings.TOKEN.PANEL_ACCESS]
            }

            for(let i = 0; i < subs.length; i++)
            {
                //Default group channel
                if(subs[i] === Const.Settings.CHANNEL.DEFAULT_USER_GROUP
                    && authUserGroup !== ''
                    && authUserGroup !== undefined)
                {
                    ChTools.kickOut(socket,Const.Settings.CHANNEL.DEFAULT_USER_GROUP);
                }

                //Auth Group
                if(subs[i].indexOf(Const.Settings.CHANNEL.AUTH_USER_GROUP_PREFIX) !== -1)
                {
                    let authGroupSub = subs[i].replace(Const.Settings.CHANNEL.AUTH_USER_GROUP_PREFIX,'');
                    if(authUserGroup !== authGroupSub)
                    {
                        ChTools.kickOut(socket,subs[i]);
                    }
                }

                //User Channel
                if(subs[i].indexOf(Const.Settings.CHANNEL.USER_CHANNEL_PREFIX) !== -1)
                {
                    let userIdSub = subs[i].replace(Const.Settings.CHANNEL.USER_CHANNEL_PREFIX,'');
                    if(userId !== userIdSub)
                    {
                        ChTools.kickOut(socket,subs[i]);
                    }
                }

                //Panel Channel
                if(subs[i] === Const.Settings.CHANNEL.PANEL && !panelAccess)
                {
                    ChTools.kickOut(socket,subs[i]);
                }

            }
        }
    }

}
