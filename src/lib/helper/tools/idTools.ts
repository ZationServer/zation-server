/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class IdTools
{
    static sidSeparator = '-|-';

    static socketSidToSocketId(socketSid : string) {
        return this.splitSid(socketSid)[2];
    }

    static splitSid(socketSid : string) : string[] {
        return socketSid.split(IdTools.sidSeparator);
    }

    static buildSid(instanceId : string, workerId : string,socketId : string) : string
    {
        return instanceId+IdTools.sidSeparator+workerId+IdTools.sidSeparator+socketId;
    }

    static socketSidToServerInstanceId(socketSid : string) {
        return this.splitSid(socketSid)[0];
    }

    static socketSidToWorkerId(socketSid : string) {
        return this.splitSid(socketSid)[1];
    }
}

export = IdTools;