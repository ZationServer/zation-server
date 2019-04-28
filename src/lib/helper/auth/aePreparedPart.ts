/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {AuthUserGroupConfig, UserGroupsConfig} from "../configDefinitions/appConfig";
import {DefaultUserGroupFallBack}              from "../constants/internal";
import ZationConfigFull                        from "../configManager/zationConfigFull";

export default class AEPreparedPart
{
    private readonly zc : ZationConfigFull;
    private readonly useAuth : boolean;
    private readonly groupsConfig : UserGroupsConfig = {};
    private readonly authGroups : Record<string,AuthUserGroupConfig>;
    private readonly defaultGroup : string;

    //prepares and check the config
    constructor(zc : ZationConfigFull)
    {
        this.zc = zc;
        this.useAuth = this.zc.mainConfig.useAuth;

        if(this.useAuth)
        {
            if(this.zc.appConfig.userGroups !== undefined)
            {
                this.groupsConfig = this.zc.appConfig.userGroups;

                this.authGroups = this.groupsConfig.auth || {};
                this.defaultGroup = this.groupsConfig.default || DefaultUserGroupFallBack;
            }
            else {
                this.defaultGroup = 'default';
                this.authGroups = {};
            }
        }
    }

    /**
     * Returns all auth user groups.
     */
    getAuthGroups() : Record<string,AuthUserGroupConfig> {
        return this.authGroups;
    }

    /**
     * Returns if the auth user group has panel access.
     * @param authUserGroup
     */
    authUserGroupPanelAccess(authUserGroup : string) : boolean {
        const tempGroup = this.getAuthGroups()[authUserGroup];
        if(tempGroup){
            return typeof tempGroup.panelAccess === 'boolean' ?
                tempGroup.panelAccess : false;
        }
        else{
            return false;
        }
    }

    /**
     * Returns the name of the default user group.
     */
    getDefaultGroup() : string {
        return this.defaultGroup;
    }

    /**
     * Returns if user auth.
     */
    isUseAuth() : boolean {
        return this.useAuth;
    }

    /**
     * Returns if the name is an auth user group.
     * @param authGroup
     */
    isAuthGroup(authGroup : string) : boolean {
        return this.authGroups.hasOwnProperty(authGroup);
    }

}

