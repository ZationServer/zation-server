/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const crypto        = require('crypto');

class SmallBag
{
    //Part Auth

    // noinspection JSUnusedGlobalSymbols
    authOutAllClientsWithId(id)
    {
        this._channelController.authOutAllClientsWithId(id);
    }

    // noinspection JSUnusedGlobalSymbols
    reAuthAllClientsWithId(id)
    {
        this._channelController.reAuthAllClientsWithId(id);
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



}

module.exports = SmallBag;