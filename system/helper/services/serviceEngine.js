/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const           = require('./../constante/constWrapper');
const ServiceBox      = require('./serviceBox');

const mySql                 = require('mysql');
const nodeMailer            = require('nodemailer');
const postgresSql           = require('pg-pool');
const mongo                 = require('mongodb-pool');

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
                return mySql.createPool(c);
            });
        promises.add(this._mySqlServiceBox.init());

        this._nodeMailerServiceBox =
            new ServiceBox(Const.Main.SERVICES_NODE_MAILER,this._sc[Const.Main.SERVICES_NODE_MAILER],async (c) =>
            {
                return nodeMailer.createTransport(c);
            });
        promises.add(this._nodeMailerServiceBox.init());

        this._postgresSqlBox =
            new ServiceBox(Const.Main.SERVICES_POSTGRES_SQL,this._sc[Const.Main.SERVICES_POSTGRES_SQL],async (c) =>
            {
                let pool =  new postgresSql(c);
                return await pool.connect();
            });
        promises.add(this._postgresSqlBox.init());

        this._mongoDbBox =
            new ServiceBox(Const.Main.SERVICES_MONGO_DB,this._sc[Const.Main.SERVICES_MONGO_DB],async (c) =>
            {
                // noinspection JSUnresolvedFunction
                return await mongo.getConnection(c.url,c);
            });
        promises.add(this._mongoDbBox.init());

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

}

module.exports = ServiceEngine;