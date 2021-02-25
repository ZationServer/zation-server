/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ChangeValue, DbProcessedSelector} from '../../main/databox/dbDefinitions';
import Socket                             from '../Socket';
import {DeepReadonly}                     from '../../main/utils/typeUtils';

export interface InsertAction {
    selector: DbProcessedSelector,
    value: any,
    /**
     * @description
     * Will change the value of this insert action for this socket.
     */
    changeValue: ChangeValue,
    code?: string | number,
    data?: any
}

export interface UpdateAction {
    selector: DbProcessedSelector,
    value: any,
    /**
     * @description
     * Will change the value of this update action for this socket.
     */
    changeValue: ChangeValue,
    code?: string | number,
    data?: any
}

export interface DeleteAction {
    selector: DbProcessedSelector,
    code?: string | number,
    data?: any
}

export interface SignalAction {
    signal: string,
    data?: any,
    /**
     * @description
     * Will change the data of this signal action for this socket.
     */
    changeData: (newData: any) => void
}

export interface FetchRequest {
    counter: number,
    input?: any,
    /**
     * @description
     * Indicates if this fetch is a reload fetch.
     */
    reload: boolean
}

export interface DbInConnection {
    readonly socket: Socket,
    readonly options?: any,
    /**
     * @description
     * Timestamp that indicates the creation time of the connection.
     */
    readonly created: number
}

export interface DbFamilyInConnection<M = string> extends DbInConnection {
    /**
     * Notice that the member is deep readonly.
     */
    readonly member: DeepReadonly<M>
}