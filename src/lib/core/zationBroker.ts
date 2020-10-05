/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import 'source-map-support/register'

import {BrokerMessageAction}  from "../main/definitions/brokerMessageAction";
import ZationConfig           from "../main/config/manager/zationConfig";
import Logger                 from "../main/log/logger";
import ZationConfigFull       from "../main/config/manager/zationConfigFull";
const SCBroker              = require('socketcluster/scbroker');
const scClusterBrokerClient = require('scc-broker-client');
import {startModeSymbol}                from './startMode';
import StartDebugStopwatch              from '../main/utils/startDebugStopwatch';
import {Writable}                       from '../main/utils/typeUtils';
import Process, {ProcessType}           from '../api/Process';
import OsUtils                          from '../main/utils/osUtils';

(Process as Writable<typeof Process>).type = ProcessType.Broker;

class ZationBroker extends SCBroker
{
    private brokerStartedTimeStamp: number;
    private zc: ZationConfig;
    private clusterClient: any;

    constructor() {
        super();
    }

    // noinspection JSUnusedGlobalSymbols
    async run()
    {
        this.zc = new ZationConfigFull(this.options.zationConfigWorkerTransport);
        global[startModeSymbol] = this.zc.getStartMode();

        process.title = `Zation Server: ${this.zc.mainConfig.instanceId} -> Broker - ${this.id}`;

        if (this.options.clusterStateServerHost) {
            // noinspection TypeScriptValidateJSTypes
            this.clusterClient =
                scClusterBrokerClient.attach(this, {
                stateServerHost: this.options.clusterStateServerHost,
                stateServerPort: this.options.clusterStateServerPort,
                authKey: this.options.clusterAuthKey,
                stateServerConnectTimeout: this.options.clusterStateServerConnectTimeout,
                stateServerAckTimeout: this.options.clusterStateServerAckTimeout,
                stateServerReconnectRandomness: this.options.clusterStateServerReconnectRandomness,
                noErrorLogging: !this.zc.mainConfig.log.core.active
            });
        }

        await this.startZBroker();
    }

    private async startZBroker()
    {
        this.brokerStartedTimeStamp = Date.now();

        //setLogger
        Logger.init(this.zc);
        Logger.log.startDebug(`The Broker with id ${this.id} begins the start process.`);

        const debugStopwatch = new StartDebugStopwatch(this.zc.isStartDebug());

        debugStopwatch.start();
        this.initBrokerEvents();
        debugStopwatch.stop(`The Broker with id ${this.id} has init broker events.`);

        Logger.log.startDebug(`The Broker with id ${this.id} is started.`);
    }

    private initBrokerEvents()
    {
        this.on('message', async (data, respond) => {
            if(data.action === BrokerMessageAction.Info){
                respond(null,{
                    id: this.id,
                    broker: {
                        pid   : process.pid,
                        system: (await OsUtils.getPidInfo()),
                        brokerStartedTimestamp : this.brokerStartedTimeStamp
                    },
                    cBrokers: this.clusterClient ? this.clusterClient.sccBrokerURIList: []
                });
            }
            else{
                respond(new Error('Unknown action'));
            }
        });
    }
}

new ZationBroker();

export = ZationBroker;