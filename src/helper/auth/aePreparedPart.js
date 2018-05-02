/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */
const Const         = require('../constants/constWrapper');
const TaskError     = require('../../api/TaskError');
const MainErrors    = require('../zationTaskErrors/mainTaskErrors');

class AEPreparedPart
{
    constructor(zc,worker)
    {
        this._zc = zc;
        this._useAuth = this._zc.getMain(Const.Main.USE_AUTH);
        this._worker = worker;

        if(this._useAuth)
        {
            this._groupsConfig        = this._zc.getApp(Const.App.GROUPS);
            this._controllerDefault   = this._zc.getApp(Const.App.CONTROLLER_DEFAULT);

            if(this._groupsConfig !== undefined)
            {
                this._authGroups = this._groupsConfig[Const.App.GROUPS_AUTH_GROUPS];
                let defaultGroup = this._groupsConfig[Const.App.GROUPS_DEFAULT_GROUP];
                if(defaultGroup === undefined)
                {
                    throw new TaskError(MainErrors.defaultGroupNotFound);
                }
                else
                {
                    this._defaultGroup = defaultGroup;
                }
            }
            else
            {
                throw new TaskError(MainErrors.groupsConfigNotFound);
            }
        }
    }

    getZationConfig()
    {
        return this._zc;
    }

    getControllerDefault()
    {
        return this._controllerDefault;
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