/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
import Const           = require('./../constants/constWrapper');

export type ErrorConfig = Record<string,ErrorConstruct>;

export interface ErrorConstruct
{
    [Const.Settings.ERROR.NAME]?: string;
    [Const.Settings.ERROR.DESCRIPTION]?: string;
    [Const.Settings.ERROR.TYPE]?: string;
    [Const.Settings.ERROR.SEND_INFO]?: boolean;
    [Const.Settings.ERROR.INFO] ?: object;
    [Const.Settings.ERROR.IS_PRIVATE] ?: boolean;
    [Const.Settings.ERROR.IS_FROM_ZATION_SYSTEM] ?: boolean;
}