/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ZationWorker         = require("../../core/zationWorker");
import {WorkerMessageAction}  from "../definitions/workerMessageAction";
import {BrokerMessageAction}  from "../definitions/brokerMessageAction";

export default class NodeInfo {

    static async getBrokerInfo(worker: ZationWorker): Promise<{brokers: object,cBrokers: object}> {
        let brokerInfo = {};
        let cBrokerInfo = {};
        let firstBroker = true;
        await (new Promise((resolve) => {
            worker.exchange.send({action: BrokerMessageAction.Info}, null , (err, data) => {
                if (err) {
                    resolve();
                } else {
                    data.forEach((d) => {
                        brokerInfo[d.id] = d.broker;
                        if(firstBroker){
                            cBrokerInfo = d.cBrokers;
                            firstBroker = false;
                        }
                    });
                    resolve();
                }
            });
        }));
        return {brokers: brokerInfo, cBrokers: cBrokerInfo};
    }

    static async getMasterInfo(worker: ZationWorker): Promise<object> {
        let info = {};
        await (new Promise((resolve) => {
            worker.sendToMaster({action: WorkerMessageAction.Info},(err, data) => {
                if (err) {
                    resolve();
                } else {
                   info = data;
                   resolve();
                }
            });
        }));
        return info;
    }
}

