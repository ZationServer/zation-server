/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const           = require('../constants/constWrapper');
const ServiceBox      = require('./serviceBox');

class ServiceEngine
{
    constructor(zc)
    {
        this._sc = zc.getMain(Const.Main.SERVICES);
        if(this._sc === undefined) {this._sc = {};}
    }

    async init()
    {
        let promises = [];

        this._mySqlServiceBox =
            new ServiceBox(Const.Main.SERVICES_MYSQL,this._sc[Const.Main.SERVICES_MYSQL],async (c) =>
            {
                const mySql = require('mysql');
                return mySql.createPool(c);
            });
        promises.push(this._mySqlServiceBox.init());

        this._nodeMailerServiceBox =
            new ServiceBox(Const.Main.SERVICES_NODE_MAILER,this._sc[Const.Main.SERVICES_NODE_MAILER],async (c) =>
            {
                const nodeMailer = require('nodemailer');
                return nodeMailer.createTransport(c);
            });
        promises.push(this._nodeMailerServiceBox.init());

        this._postgresSqlBox =
            new ServiceBox(Const.Main.SERVICES_POSTGRES_SQL,this._sc[Const.Main.SERVICES_POSTGRES_SQL],async (c) =>
            {
                const postgresSql = require('pg-pool');
                let pool =  new postgresSql(c);
                return await pool.connect();
            });
        promises.push(this._postgresSqlBox.init());

        this._mongoDbBox =
            new ServiceBox(Const.Main.SERVICES_MONGO_DB,this._sc[Const.Main.SERVICES_MONGO_DB],async (c) =>
            {
                const mongo = require('mongodb-pool');
                // noinspection JSUnresolvedFunction
                return await mongo.getConnection(c.url,c);
            });
        promises.push(this._mongoDbBox.init());

        await Promise.all(promises);
    }

    getMySqlService(key)
    {
        this._mySqlServiceBox.getService(key);
    }

    getNodeMailerService(key)
    {
        this._nodeMailerServiceBox.getService(key);
    }

    getPostgresSqlService(key)
    {
        this._postgresSqlBox.getService(key);
    }

    getMongoDbService(key)
    {
        this._mongoDbBox.getService(key);
    }

    getService(name,key)
    {

    }

}

module.exports = ServiceEngine;