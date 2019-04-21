/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export default class IdUtils
{
    static sidSeparator = '-|-';

    static socketSidToSocketId(socketSid : string) {
        return this.splitSid(socketSid)[2];
    }

    static splitSid(socketSid : string) : string[] {
        return socketSid.split(IdUtils.sidSeparator);
    }

    static buildSid(instanceId : string, workerId : string,socketId : string) : string
    {
        return instanceId+IdUtils.sidSeparator+workerId+IdUtils.sidSeparator+socketId;
    }

    static socketSidToServerInstanceId(socketSid : string) {
        return this.splitSid(socketSid)[0];
    }

    static socketSidToWorkerId(socketSid : string) {
        return this.splitSid(socketSid)[1];
    }
}