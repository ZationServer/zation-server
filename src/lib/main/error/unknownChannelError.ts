/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import CodeError        from "./codeError";
import {MainBackErrors} from "../zationBackErrors/mainBackErrors";

export default class UnknownChannelError extends CodeError
{
    private readonly _channel: string;

    constructor(channel: string) {
        super(MainBackErrors.unknownChannel,{name: channel});
        this._channel = channel;
    }

    get channel(): string {
        return this._channel;
    }
}