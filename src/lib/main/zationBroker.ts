/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const SCBroker = require('socketcluster/scbroker');
const scClusterBrokerClient = require('scc-broker-client');

class Broker extends SCBroker {
    // noinspection JSUnusedGlobalSymbols
    run()
    {
        if (this.options.clusterStateServerHost) {
            scClusterBrokerClient.attach(this, {
                stateServerHost: this.options.clusterStateServerHost,
                stateServerPort: this.options.clusterStateServerPort,
                authKey: this.options.clusterAuthKey,
                stateServerConnectTimeout: this.options.clusterStateServerConnectTimeout,
                stateServerAckTimeout: this.options.clusterStateServerAckTimeout,
                stateServerReconnectRandomness: this.options.clusterStateServerReconnectRandomness
            });
        }
    }
}

new Broker();

export = Broker;