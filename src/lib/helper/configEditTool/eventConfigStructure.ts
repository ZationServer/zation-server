/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import Const                         = require('./../constants/constWrapper');
import {PoolConfig}                  from "mysql";
import * as SMTPTransport            from "nodemailer/lib/smtp-transport";
import * as SMTPPool                 from "nodemailer/lib/smtp-pool";
import * as SendmailTransport        from "nodemailer/lib/sendmail-transport";
import * as StreamTransport          from "nodemailer/lib/stream-transport";
import * as JSONTransport            from "nodemailer/lib/json-transport";
import * as SESTransport             from "nodemailer/lib/ses-transport";
import {Transport, TransportOptions} from "nodemailer";
import {ConnectionConfig}            from "pg";
import {MongoClientOptions}          from "mongodb";


interface EventConfig
{


}
export = EventConfig;
