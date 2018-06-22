/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
const Const         = require('../constants/constWrapper');
const Logger        = require('./../logger/logger');
const TaskError     = require('../../api/TaskError');
const MainErrors    = require('../zationTaskErrors/mainTaskErrors');

class AEPreparedPart
{
    //prepares and check the config
    constructor(zc,worker)
    {
        this._zc = zc;
        this._useAuth = this._zc.getMain(Const.Main.KEYS.USE_AUTH);
        this._worker = worker;

        if(this._useAuth)
        {
            this._groupsConfig = this._zc.getApp(Const.App.KEYS.USER_GROUPS);

            if(this._groupsConfig !== undefined)
            {
                let authGroups = this._groupsConfig[Const.App.USER_GROUPS.AUTH];
                this._authGroups = authGroups !== undefined ? authGroups : {};

                let defaultGroup = this._groupsConfig[Const.App.USER_GROUPS.DEFAULT];
                if(defaultGroup === undefined)
                {
                    this._defaultGroup = Const.Settings.DEFAULT_USER_GROUP.FALLBACK;
                    Logger.printConfigWarning(Const.Settings.CN.APP,'No settings for the default user group found!' +
                        ' DefaultUserGroup is set to \'default\'');
                }
                else
                {
                    this._defaultGroup = defaultGroup;
                }
            }
            else
            {
                this._defaultGroup = 'default';
                this._authGroups = {};
                Logger.printConfigWarning(Const.Settings.CN.APP,'No settings for the user groups are found!' +
                    ' DefaultUserGroup is set to \'default\'');
            }
        }
    }

    getZationConfig()
    {
        return this._zc;
    }

    getAuthGroups()
    {
        return this._authGroups;
    }

    getDefaultGroup()
    {
        return this._defaultGroup;
    }

    getWorker()
    {
        return this._worker;
    }

    useAuth()
    {
        return this._useAuth;
    }
}

module.exports = AEPreparedPart;