/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

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
    services  ?: Service;
    customServices  ?: Record<string,MainCustomService>;
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

type MongoDbUrl = {
    url : string
}

export type MongoDbConfig = (
    MongoClientOptions & MongoDbUrl
    );

export interface Service
{
    mySql  ?: Record<string,PoolConfig> | DefaultConfig<PoolConfig>;
    nodeMailer  ?: Record<string,NodeMailerConfig> | DefaultConfig<NodeMailerConfig>;
    postgresSql  ?: Record<string,ConnectionConfig> | DefaultConfig<ConnectionConfig>;
    mongoDb  ?: Record<string,MongoDbConfig> | DefaultConfig<MongoDbConfig>;
}

export type CustomServiceCreateFunction<T,C> = (config : C,name : string) => Promise<T> | T;
export type CustomServiceGetFunction<T,R> = (service : T) => Promise<R> | R;

export interface CustomService
{
    create : CustomServiceCreateFunction<any,any>;
    get ?: CustomServiceGetFunction<any,any>
}

export interface DefaultConfig<T>
{
    default ?: T;
}

