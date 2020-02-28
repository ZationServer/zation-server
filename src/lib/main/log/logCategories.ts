/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export const enum ConsoleColor {
    Red = 1,
    Green = 2,
    Yellow = 3,
    Blue = 4,
    Magenta = 5,
    Cyan = 6,
    White = 7
}

export interface LogCategory {
    /**
     * Name of the log category.
     * Will be displayed in the log message.
     */
    name: string,
    /**
     * Log level of the category.
     */
    level: number,
    /**
     * Color of the category.
     */
    color?: ConsoleColor
}

export const defaultLogCategories = {
    debug: {
        name: 'DEBUG',
        level: 6,
        color: ConsoleColor.Blue
    } as LogCategory,
    startDebug: {
        name: 'START-DEBUG',
        level: 6,
        color: ConsoleColor.Magenta
    } as LogCategory,
    info: {
        name: 'INFO',
        level: 5,
        color: ConsoleColor.Cyan
    } as LogCategory,
    busy: {
        name: 'BUSY',
        level: 5,
        color: ConsoleColor.Yellow
    } as LogCategory,
    warn: {
        name: 'WARNING',
        level: 4,
        color: ConsoleColor.Yellow
    } as LogCategory,
    error: {
        name: 'ERROR',
        level: 3,
        color: ConsoleColor.Red
    } as LogCategory,
    failed: {
        name: 'FAILED',
        level: 2,
        color: ConsoleColor.Red
    } as LogCategory,
    fatal: {
        name: 'FATAL',
        level: 2,
        color: ConsoleColor.Red
    } as LogCategory,
    active: {
        name: 'ACTIVE',
        level: 1,
        color: ConsoleColor.Green
    } as LogCategory
};