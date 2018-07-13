/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import Const                         = require('./../constants/constWrapper');
import ExpressCore                   = require("express-serve-static-core");
import SmallBag                      = require("../../api/SmallBag");
import ZationInfoObj                 = require("../infoObjects/zationInfoObj");
import ZationWorker                  = require("../../main/zationWorker");
import TaskError                     = require("../../api/TaskError");
import TaskErrorBag                  = require("../../api/TaskErrorBag");

export type ExpressFunction = (smallBag : SmallBag, express : ExpressCore.Express) => Promise<void> | void;
export type WorkerIsStartedFunction = (smallBag : SmallBag, info : ZationInfoObj, worker : ZationWorker) => Promise<void> | void;
export type HttpServerIsStartedFunction = (info : ZationInfoObj) => Promise<void> | void;
export type WsServerIsStartedFunction = (info : ZationInfoObj) => Promise<void> | void;
export type IsStartedFunction = (info : ZationInfoObj) => Promise<void> | void;
export type BeforeErrorFunction = (smallBag : SmallBag, error : object) => Promise<void> | void;
export type BeforeTaskErrorFunction = (smallBag : SmallBag, taskError : TaskError) => Promise<void> | void;
export type BeforeTaskErrorBagFunction = (smallBag : SmallBag, taskErrorBag : TaskErrorBag) => Promise<void> | void;
export type GetUserCountFunction = (smallBag : SmallBag) => Promise<number> | number;

export interface EventConfig
{
    [Const.Event.ZATION_EXPRESS] ?: ExpressFunction | ExpressFunction[];
    [Const.Event.ZATION_WORKER_IS_STARTED] ?: WorkerIsStartedFunction | ExpressFunction[];
    [Const.Event.ZATION_HTTP_SERVER_IS_STARTED] ?: HttpServerIsStartedFunction | HttpServerIsStartedFunction[];
    [Const.Event.ZATION_WS_SERVER_IS_STARTED] ?: WsServerIsStartedFunction | WsServerIsStartedFunction[];
    [Const.Event.ZATION_IS_STARTED] ?: IsStartedFunction | IsStartedFunction[];
    [Const.Event.ZATION_BEFORE_ERROR] ?: BeforeErrorFunction | BeforeErrorFunction[];
    [Const.Event.ZATION_BEFORE_TASK_ERROR] ?: BeforeTaskErrorFunction | BeforeTaskErrorFunction[];
    [Const.Event.ZATION_BEFORE_TASK_ERROR_BAG] ?: BeforeTaskErrorBagFunction | BeforeTaskErrorBagFunction[];
    [Const.Event.ZATION_GET_USER_COUNT] ?: GetUserCountFunction;
}
