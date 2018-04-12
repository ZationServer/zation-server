/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const Const           = require('./../constante/constWrapper');
const ServiceBox      = require('./serviceBox');

const mySql                 = require('mysql');
const nodeMailer            = require('nodemailer');

class ServiceEngine
{
    constructor(zc)
    {
        this._sc = zc.getMain(Const.Main.SERVICES);
        if(this._sc === undefined) {this._sc = {};}

        this._mySqlServiceBox =
            new ServiceBox(Const.Main.SERVICES_MYSQL,this._sc[Const.Main.SERVICES_MYSQL],(c) =>
        {
            return mySql.createPool(c);
        });

        this._nodeMailerServiceBox =
            new ServiceBox(Const.Main.SERVICES_NODE_MAILER,this._sc[Const.Main.SERVICES_NODE_MAILER],(c) =>
        {
            return nodeMailer.createTransport(c);
        });
    }


    getMySQLService(key)
    {
        this._mySqlServiceBox.getService(key);
    }

    getNodeMailerService(key)
    {
        this._nodeMailerServiceBox.getService(key);
    }

}

module.exports = ServiceEngine;