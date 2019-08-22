/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {BrokerMessageAction}  from "../main/constants/brokerMessageAction";
import SystemInfo             from "../main/utils/systemInfo";
import ZationConfig           from "../main/config/manager/zationConfig";
import Logger                 from "../main/logger/logger";
import ZationConfigFull       from "../main/config/manager/zationConfigFull";
const SCBroker              = require('socketcluster/scbroker');
const scClusterBrokerClient = require('scc-broker-client');

class ZationBroker extends SCBroker
{
    private brokerStartedTimeStamp : number;
    private zc : ZationConfig;
    private clusterClient : any;

    constructor() {
        super();
    }

    // noinspection JSUnusedGlobalSymbols
    async run()
    {
        this.zc = new ZationConfigFull(this.options.zationConfigWorkerTransport);
        global['_ZATION_START_MODE'] = this.zc.getStartMode();

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
                noErrorLogging : !this.zc.mainConfig.scConsoleLog
            });
        }

        await this.startZBroker();
    }

    private async startZBroker()
    {
        this.brokerStartedTimeStamp = Date.now();

        //setLogger
        Logger.setZationConfig(this.zc);
        Logger.printStartDebugInfo(`The Broker with id ${this.id} begins the start process.`,false,true);

        Logger.startStopWatch();
        this.initBrokerEvents();
        Logger.printStartDebugInfo(`The Worker with id ${this.id} has init broker events.`,true);

        Logger.printStartDebugInfo(`The Broker with id ${this.id} is started.`,false);
    }

    private initBrokerEvents()
    {
        this.on('message', async (data, respond) => {
            if(data.action === BrokerMessageAction.INFO){
                respond(null,{
                    id : this.id,
                    broker : {
                        pid    : process.pid,
                        system : (await SystemInfo.getPidInfo()),
                        brokerStartedTimestamp  : this.brokerStartedTimeStamp
                    },
                    cBrokers : this.clusterClient ? this.clusterClient.sccBrokerURIList : []
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