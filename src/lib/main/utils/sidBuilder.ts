/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export default class SidBuilder
{
    static sidSeparator = '-|-';

    private readonly preSid : string;

    constructor(instanceId : string, workerId : string) {
        this.preSid = instanceId+SidBuilder.sidSeparator+workerId+SidBuilder.sidSeparator;
    }

    buildSid(socketId : string) : string {
        return this.preSid + socketId;
    }

    static splitSid(socketSid : string) : string[] {
        return socketSid.split(SidBuilder.sidSeparator);
    }

    static buildSid(instanceId : string, workerId : string,socketId : string) : string {
        return instanceId+SidBuilder.sidSeparator+workerId+SidBuilder.sidSeparator+socketId;
    }

    static socketSidToServerInstanceId(socketSid : string) {
        return this.splitSid(socketSid)[0];
    }

    static socketSidToWorkerId(socketSid : string) {
        return this.splitSid(socketSid)[1];
    }

    static socketSidToSocketId(socketSid : string) {
        return this.splitSid(socketSid)[2];
    }
}