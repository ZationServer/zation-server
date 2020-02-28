/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {LogWriter}                         from './logWriter';
import {formatArgs}                        from './formatter';
import {defaultLogCategories, LogCategory} from './logCategories';
import {onProcessEnd}                      from '../utils/processEndEvent';

export default interface SimpleLogger {
    /**
     * @description
     * Logging with a custom category.
     * @param args
     */
    custom: (category: LogCategory,...args: any[]) => void;

    /**
     * @description
     * Logging with category: debug.
     * @param args
     */
    debug: (...args: any[]) => void;

    /**
     * @description
     * Logging with category: start debug.
     * @param args
     */
    startDebug: (...args: any[]) => void;

    /**
     * @description
     * Logging with category: information.
     * @param args
     */
    info: (...args: any[]) => void;

    /**
     * @description
     * Logging with category: busy.
     * @param args
     */
    busy: (...args: any[]) => void;

    /**
     * @description
     * Logging with category: warning.
     * @param args
     */
    warn: (...args: any[]) => void;

    /**
     * @description
     * Logging with category: error.
     * @param args
     */
    error: (...args: any[]) => void;

    /**
     * @description
     * Logging with category: failed.
     * @param args
     */
    failed: (...args: any[]) => void;

    /**
     * @description
     * Logging with category: fatal.
     * @param args
     */
    fatal: (...args: any[]) => void;

    /**
     * @description
     * Logging with category: active.
     * @param args
     */
    active: (...args: any[]) => void;
}

export const EmptySimpleLogger: SimpleLogger = {
    custom: () => {},
    debug: () => {},
    startDebug: () => {},
    info: () => {},
    busy: () => {},
    warn: () => {},
    error: () => {},
    failed: () => {},
    fatal: () => {},
    active: () => {}
};

export function createSimpleLogger(writer: LogWriter[],startDebug: boolean,debug: boolean): SimpleLogger {
    const writerLength = writer.length;

    //close writer on process end
    onProcessEnd(() => {
        for(let i = 0; i < writerLength; i++){
            writer[i].close();
        }
    });

    const write = (args: any[],category: LogCategory) => {
        const msg = formatArgs(args);
        for(let i = 0; i < writerLength; i++){
            writer[i].write(msg,category);
        }
    };
    const buildCategoryLogger = (category: LogCategory) => (...args) => write(args,category);

    return {
        custom: (category, ...args) => write(args,category),
        debug: debug ? buildCategoryLogger(defaultLogCategories.debug) : () => {},
        startDebug: startDebug ? buildCategoryLogger(defaultLogCategories.startDebug) : () => {},
        info: buildCategoryLogger(defaultLogCategories.info),
        busy: buildCategoryLogger(defaultLogCategories.busy),
        warn: buildCategoryLogger(defaultLogCategories.warn),
        error: buildCategoryLogger(defaultLogCategories.error),
        failed: buildCategoryLogger(defaultLogCategories.failed),
        fatal: buildCategoryLogger(defaultLogCategories.fatal),
        active: buildCategoryLogger(defaultLogCategories.active)
    };
}