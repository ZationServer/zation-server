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

    static socketSidToServerInstanceId(socketSid : string) {
        return this.splitSid(socketSid)[0];
    }

    static socketSidToWorkerId(socketSid : string) {
        return this.splitSid(socketSid)[1];
    }
}

export = IdTools;