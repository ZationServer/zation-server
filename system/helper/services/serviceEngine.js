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

    getPostgresSql(key)
    {
        this._postgresSqlBox.getService(key);
    }

}

module.exports = ServiceEngine;