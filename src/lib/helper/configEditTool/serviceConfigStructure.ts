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


export interface ServiceConfig
{
    [Const.Service.KEYS.SERVICES] ?: Service;

    [Const.Service.KEYS.CUSTOM_SERVICES] ?:
        Record<string,(CustomService | Record<string,object> | DefaultConfig<object>)>;
}

export type MainCustomService = CustomService | Record<string,object> | DefaultConfig<object>;

export type NodeMailerConfig = (
    SMTPTransport | SMTPTransport.Options |
    SMTPPool | SMTPPool.Options |
    SendmailTransport | SendmailTransport.Options |
    StreamTransport | StreamTransport.Options |
    JSONTransport | JSONTransport.Options |
    SESTransport | SESTransport.Options |
    Transport | TransportOptions
    );

export interface Service
{
    [Const.Service.SERVICES.MYSQL] ?: Record<string,PoolConfig> | DefaultConfig<PoolConfig>;
    [Const.Service.SERVICES.NODE_MAILER] ?: Record<string,NodeMailerConfig> | DefaultConfig<NodeMailerConfig>;
    [Const.Service.SERVICES.POSTGRES_SQL] ?: Record<string,ConnectionConfig> | DefaultConfig<ConnectionConfig>;
    [Const.Service.SERVICES.MONGO_DB] ?: Record<string,MongoClientOptions> | DefaultConfig<MongoClientOptions>;
}

export type CustomServiceCreateFunction<T> = (config : object) => Promise<T>;
export type CustomServiceGetFunction<T,R> = (service : T) => Promise<R>;

export interface CustomService
{
    [Const.Service.CUSTOM_SERVICES.CREATE] ?: CustomServiceCreateFunction<any>;
    [Const.Service.CUSTOM_SERVICES.GET] ?: CustomServiceGetFunction<any,any>
}

export interface DefaultConfig<T>
{
    default ?: T;
}

