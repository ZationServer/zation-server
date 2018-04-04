/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const CA            = require('../helper/constante/settings');
const ClientStorage = require('../helper/clientStorage/TokenStorage');
const cationConfig  = require('./../App/Config/cation.config');
const crypto        = require('crypto');

class Bag
{

    constructor({isSocket,authController,req,res,socket,scServer,paramData,channelController,services})
    {
        this._bagVariables = {};

        this._isSocket = isSocket;
        this._authController = authController;
        this._req = req;
        this._res = res;
        this._socket = socket;
        this._scServer = scServer;
        this._paramData  = paramData;
        this._channelController = channelController;
        this._services = services;

        this._mySqlPoolWrapper = this._services['mySqlPoolWrapper'];
        this._nodeMailerWrapper = this._services['nodeMailerWrapper'];

        this._params = this._paramData[CA.PARAM_DATA_PARAMS];
        this._paramsMissing = this._paramData[CA.PARAM_DATA_PARAMS_Missing];
    }

    //Part Bag Variable

    // noinspection JSUnusedGlobalSymbols
    setBagVariable(key,value,overwrite = true)
    {
        if((this._bagVariables.hasOwnProperty(key) && overwrite)
        || !this._bagVariables.hasOwnProperty(key))
        {
            this._bagVariables[key] = value;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    hasBagVariable(key)
    {
        return this._bagVariables.hasOwnProperty(key);
    }

    // noinspection JSUnusedGlobalSymbols
    getBagVariable(key)
    {
        return this._bagVariables[key];
    }

    //Part Param

    // noinspection JSUnusedGlobalSymbols
    getParam(name)
    {
        return this._params[name];
    }

    // noinspection JSUnusedGlobalSymbols
    isParam(name)
    {
        return this._params[name] !== undefined;
    }

    // noinspection JSUnusedGlobalSymbols
    isAParamMissing()
    {
        return this._paramsMissing;
    }

    //Part Auth

    // noinspection JSUnusedGlobalSymbols
    isAuth()
    {
        return this._authController.isAuth();
    }

    // noinspection JSUnusedGlobalSymbols
    authOutAllClientsWithId(id)
    {
        this._channelController.authOutAllClientsWithId(id);
    }

    // noinspection JSUnusedGlobalSymbols
    reAuthAllClientsWithId(id)
    {
        this._channelController. reAuthAllClientsWithId(id);
    }

    // noinspection JSUnusedGlobalSymbols
    getAuthGroup()
    {
        return this._authController.getAuthGroup();
    }

    // noinspection JSUnusedGlobalSymbols
    getGroup()
    {
        return this._authController.getGroup();
    }

    // noinspection JSUnusedGlobalSymbols
    authTo(group,id,clientData = {})
    {
        this._authController.authTo(group,id,clientData);
    }

    // noinspection JSUnusedGlobalSymbols
    setClientId(id)
    {
        this._authController.setClientId(id);
    }

    // noinspection JSUnusedGlobalSymbols
    getClientId()
    {
        this._authController.getClientId();
    }

    // noinspection JSUnusedGlobalSymbols
    authOut()
    {
        this._authController.authOut();
    }

    // noinspection JSUnusedGlobalSymbols
    getAuthController()
    {
        return this._authController;
    }

    // noinspection JSUnusedGlobalSymbols
    isDefault()
    {
        return this._authController.isDefault();
    }

    // noinspection JSUnusedGlobalSymbols
    isUseAuth()
    {
        return this._authController.isUseAuth();
    }

    //Part Cookie

    // noinspection JSUnusedGlobalSymbols
    getCookieVariable(key)
    {
        if(this._isSocket)
        {
            return undefined;
        }
        else
        {
            return this._req.cookies[key];
        }
    }

    // noinspection JSUnusedGlobalSymbols
    setCookieVariable(key,value,settings = { maxAge: 900000})
    {
        if(this._isSocket)
        {
            return false;
        }
        else
        {
            this._res.cookie(key,value,settings);
            return true;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    clearCookie(key)
    {
        if(this._isSocket)
        {
            return false;
        }
        else
        {
            this._res.clearCookie(key);
            return true;
        }
    }

    //Part Http

    // noinspection JSUnusedGlobalSymbols
    getResponse()
    {
        return this._res;
    }

    // noinspection JSUnusedGlobalSymbols
    getRequest()
    {
        return this._req;
    }

    //Part Client Storage

    // noinspection JSUnusedGlobalSymbols
    setClientVariable(key,value)
    {
       let obj = {};
       obj[key] = value;
       ClientStorage.setClientData(obj,this._isSocket,this._socket,this._req,this._channelController);
    }

    // noinspection JSUnusedGlobalSymbols
    getClientVariable(key)
    {
        return ClientStorage.getClientVariable(key,this._isSocket,this._socket,this._req);
    }

    //Part Socket

    // noinspection JSUnusedGlobalSymbols
    getSocketId()
    {
        return this._socket.id;
    }

    // noinspection JSUnusedGlobalSymbols
    getSocket()
    {
        return this._socket;
    }

    // noinspection JSUnusedGlobalSymbols
    getScServer()
    {
        return this._scServer;
    }

    //Part Protocol

    // noinspection JSUnusedGlobalSymbols
    getProtocol()
    {
        return this._authController.getProtocol();
    }

    // noinspection JSUnusedGlobalSymbols
    isSocketProtocol()
    {
        return this._isSocket();
    }

    //Part Socket Channel

    // noinspection JSUnusedGlobalSymbols
    publishToSpecifyUser(id,eventName,data,cb)
    {
        this._channelController.publishInUserCh(id,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToSpecifyUsers(ids,eventName,data,cb)
    {
       this._channelController.publishInUserChannels(ids,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToAll(eventName,data,cb)
    {
        this._channelController.publishInAllCh(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    emitToThisClient(eventName,data,cb)
    {
        return this._channelController.emitToSocket(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToAuthGroup(authGroup,eventName,data,cb)
    {
        this._channelController.publishInAuthGroupCh(authGroup,eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToDefaultGroup(eventName,data,cb)
    {
        this._channelController.publishInDefaultGroupCh(eventName,data,cb);
    }

    // noinspection JSUnusedGlobalSymbols
    publishToAllAuthGroups(eventName,data,cb)
    {
        let groups = cationConfig[CA.CATION_AUTH_GROUPS][CA.AUTH_AUTH_GROUPS];
        for(let k in groups)
        {
            if(groups.hasOwnProperty(k))
            {
                this.publishToAuthGroup(groups[k],eventName,data,cb);
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    publishInSpecialChannel(channel,id,eventName,data,cb)
    {
        this._channelController.publishInSpecialChannel(channel,id,eventName,data,cb);
    }

    //Part Database -> MySql

    // noinspection JSUnusedGlobalSymbols
    mySqlQuery(query,func)
    {
        this._mySqlPoolWrapper.getService().query(query,func);
    }

    // noinspection JSUnusedGlobalSymbols
    mySqlPrepareQuery(query,inserts)
    {
        return this._mySqlPoolWrapper.getService().format(query,inserts);
    }

    // noinspection JSUnusedGlobalSymbols
    getMySqlPool()
    {
        return this._mySqlPoolWrapper.getService();
    }

    //Part NodeMailer

    // noinspection JSUnusedGlobalSymbols
    sendMail(mailOptions,func)
    {
        this._nodeMailerWrapper.getService().sendMail(mailOptions,func);
    }
    // noinspection JSUnusedGlobalSymbols
    getMailTransport()
    {
        return this._nodeMailerWrapper.getService();
    }

    //Part Crypto

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    hashSha512(string,salt)
    {
        return this.hashIn('sha512',string,salt);
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    hashIn(hash,string,salt)
    {
        if(salt !== undefined)
        {
            return crypto.createHmac(hash,salt).update(string).digest('hex');
        }
        else
        {
            return crypto.createHash(hash).update(string).digest('hex');
        }
    }

    // noinspection JSUnusedGlobalSymbols,JSMethodCanBeStatic
    getRandomString(length)
    {
        return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length);
    }

    //Part Amazon s3

    // noinspection JSUnusedGlobalSymbols
    uploadFileToBucket()
    {

    }

    // noinspection JSUnusedGlobalSymbols
    getFileFromBucket()
    {

    }


}

module.exports = Bag;