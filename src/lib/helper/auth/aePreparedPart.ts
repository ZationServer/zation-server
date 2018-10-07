/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import Const        = require('../constants/constWrapper');
import ZationWorker = require("../../main/zationWorker");
import ZationConfig = require("../../main/zationConfig");

class AEPreparedPart
{
    private readonly zc : ZationConfig;
    private readonly useAuth : boolean;
    private readonly worker : ZationWorker;
    private readonly groupsConfig : object;
    private readonly authGroups : object;
    private readonly defaultGroup : string;

    //prepares and check the config
    constructor(zc : ZationConfig,worker : ZationWorker)
    {
        this.zc = zc;
        this.useAuth = this.zc.getMain(Const.Main.KEYS.USE_AUTH);
        this.worker = worker;

        if(this.isUseAuth)
        {
            this.groupsConfig = this.zc.getApp(Const.App.KEYS.USER_GROUPS);

            if(this.groupsConfig !== undefined)
            {
                let authGroups = this.groupsConfig[Const.App.USER_GROUPS.AUTH];
                this.authGroups = authGroups !== undefined ? authGroups : {};

                let defaultGroup = this.groupsConfig[Const.App.USER_GROUPS.DEFAULT];
                if(defaultGroup === undefined)
                {
                    this.defaultGroup = Const.Settings.DEFAULT_USER_GROUP.FALLBACK;
                }
                else
                {
                    this.defaultGroup = defaultGroup;
                }
            }
            else
            {
                this.defaultGroup = 'default';
                this.authGroups = {};
            }
        }
    }

    getZationConfig() : ZationConfig
    {
        return this.zc;
    }

    getAuthGroups() : object
    {
        return this.authGroups;
    }

    authUserGroupPanelAccess(authUserGroup : string) : boolean
    {
        const tempGroup = this.getAuthGroups()[authUserGroup];
        if(!!tempGroup){
            return !!tempGroup[Const.App.AUTH_USER_GROUP.PANEL_ACCESS] ?
                tempGroup[Const.App.AUTH_USER_GROUP.PANEL_ACCESS] : false;
        }
        else{
            return false;
        }
    }

    getDefaultGroup() : string
    {
        return this.defaultGroup;
    }

    getWorker() : ZationWorker
    {
        return this. worker;
    }

    isUseAuth() : boolean
    {
        return this.useAuth;
    }

    isAuthGroup(authGroup : string) : boolean
    {
        return this.authGroups.hasOwnProperty(authGroup);
    }

}

export = AEPreparedPart;