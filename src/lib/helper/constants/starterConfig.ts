/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class KEYS
{
    static readonly CONTROLLER             = 'controller';
    static readonly CONFIG                 = 'configs';

    static readonly APP_CONFIG             = 'app.config';
    static readonly CHANNEL_CONFIG         = 'channel.config';
    static readonly MAIN_CONFIG            = 'main.config';
    static readonly ERROR_CONFIG           = 'error.config';
    static readonly EVENT_CONFIG           = 'event.config';
    static readonly SERVICE_CONFIG         = 'service.config';
}

class StarterConfig
{
    public static readonly KEYS = KEYS;
}

export = StarterConfig;