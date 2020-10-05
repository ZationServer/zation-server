import {Events, PreparedEvents} from '../config/definitions/parts/events';
import {AnyFunction} from '../utils/typeUtils';
import FuncUtils from '../utils/funcUtils';

export default class EventPreparer {

    static prepare(events: Events = {}): PreparedEvents {
        const defaultFunc = () => {};
        const res: PreparedEvents = {
            express: defaultFunc,
            socketServer: defaultFunc,
            workerInit: defaultFunc,
            beforeComponentsInit: defaultFunc,
            afterComponentsInit: defaultFunc,
            masterInit: defaultFunc,
            workerStarted: defaultFunc,
            httpServerStarted: defaultFunc,
            wsServerStarted: defaultFunc,
            started: defaultFunc,
            error: defaultFunc,
            backErrors: defaultFunc,
            codeError: defaultFunc,
            workerMessage: defaultFunc,
            socketInit: defaultFunc,
            socketConnection: defaultFunc,
            socketDisconnection: defaultFunc,
            socketAuthentication: defaultFunc,
            socketDeauthentication: defaultFunc,
            socketAuthStateChange: defaultFunc,
            socketError: defaultFunc,
            socketRaw: defaultFunc,
            socketConnectionAbort: defaultFunc,
            socketBadAuthToken: defaultFunc
        };

        //prepare error event first
        const errorEvent = EventPreparer.prepareEvent(nameof<Events>(s => s.error),
            events.error || defaultFunc);
        res[nameof<Events>(s => s.error)] = errorEvent;

        for(const k in events) {
            if (events.hasOwnProperty(k) && k !== nameof<Events>(s => s.error)) {
                res[k] = EventPreparer.prepareEvent(k,events[k],errorEvent);
            }
        }
        return res as PreparedEvents;
    }

    static prepareEvent<T extends AnyFunction>(
        eventName: string,func: T | T[],
        errorEvent?: PreparedEvents['error']
    ): (...args: Parameters<T>) => Promise<void>
    {
        return FuncUtils.createSafeCaller(
            FuncUtils.createFuncAsyncInvoker(func),
            `An error was thrown in the event: '${eventName}' :`,
            errorEvent
        );
    }

}