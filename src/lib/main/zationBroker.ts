/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationConfig         = require("./zationConfig");
import Logger               = require("../helper/logger/logger");
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
        await this.startZBroker();

        if (this.options.clusterStateServerHost) {
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
    }

    private async startZBroker()
    {
        this.brokerStartedTimeStamp = Date.now();

        let zcOptions = this.options.zationConfigWorkerTransport;
        this.zc = new ZationConfig(zcOptions,true);

        //setLogger
        Logger.setZationConfig(this.zc);
        Logger.printStartDebugInfo(`Broker with id ${this.id} begin start process.`,false,true);
        Logger.printStartDebugInfo(`Broker with id ${this.id} is started.`,false);
    }
}

new ZationBroker();

export = ZationBroker;