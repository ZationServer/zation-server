/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import ZationWorker = require("../../main/zationWorker");
import {AuthUserGroupConfig, UserGroupsConfig} from "../configDefinitions/appConfig";
import {DefaultUserGroupFallBack}              from "../constants/internal";
import ZationConfigFull                      from "../configManager/zationConfigFull";

export default class AEPreparedPart
{
    private readonly zc : ZationConfigFull;
    private readonly useAuth : boolean;
    private readonly worker : ZationWorker;
    private readonly groupsConfig : UserGroupsConfig = {};
    private readonly authGroups : Record<string,AuthUserGroupConfig>;
    private readonly defaultGroup : string;

    //prepares and check the config
    constructor(zc : ZationConfigFull, worker : ZationWorker)
    {
        this.zc = zc;
        this.useAuth = this.zc.mainConfig.useAuth;
        this.worker = worker;

        if(this.useAuth)
        {
            if(this.zc.appConfig.userGroups !== undefined)
            {
                this.groupsConfig = this.zc.appConfig.userGroups;

                const authGroups = this.groupsConfig.auth;
                this.authGroups = authGroups !== undefined ? authGroups : {};

                const defaultGroup = this.groupsConfig.default;
                if(defaultGroup === undefined) {
                    this.defaultGroup = DefaultUserGroupFallBack;
                }
                else {
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

    getAuthGroups() : Record<string,AuthUserGroupConfig>
    {
        return this.authGroups;
    }

    authUserGroupPanelAccess(authUserGroup : string) : boolean
    {
        const tempGroup = this.getAuthGroups()[authUserGroup];
        if(!!tempGroup){
            return !!tempGroup.panelAccess ? tempGroup.panelAccess : false;
        }
        else{
            return false;
        }
    }

    getDefaultGroup() : string {
        return this.defaultGroup;
    }

    isUseAuth() : boolean {
        return this.useAuth;
    }

    isAuthGroup(authGroup : string) : boolean {
        return this.authGroups.hasOwnProperty(authGroup);
    }

}

