/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AuthUserGroupConfig, UserGroupsConfig} from "../config/definitions/parts/userGroupsConfig";
import {DEFAULT_USER_GROUP_FALLBACK}              from "../constants/internal";
import ZationConfigFull                        from "../config/manager/zationConfigFull";

export default class AEPreparedPart
{
    private readonly zc: ZationConfigFull;
    private readonly groupsConfig: UserGroupsConfig = {};
    private readonly authGroups: Record<string,AuthUserGroupConfig>;
    private readonly defaultGroup: string;

    //prepares and check the config
    constructor(zc: ZationConfigFull)
    {
        this.zc = zc;

        if(this.zc.appConfig.userGroups !== undefined) {
            this.groupsConfig = this.zc.appConfig.userGroups;

            this.authGroups = this.groupsConfig.auth || {};
            this.defaultGroup = this.groupsConfig.default || DEFAULT_USER_GROUP_FALLBACK;
        }
        else {
            this.defaultGroup = 'default';
            this.authGroups = {};
        }
    }

    /**
     * Returns all auth user groups.
     */
    getAuthGroups(): Record<string,AuthUserGroupConfig> {
        return this.authGroups;
    }

    /**
     * Returns if the auth user group has panel access.
     * @param authUserGroup
     */
    authUserGroupPanelAccess(authUserGroup: string): boolean {
        const tempGroup = this.getAuthGroups()[authUserGroup];
        if(tempGroup){
            return typeof tempGroup.panelAccess === 'boolean' ?
                tempGroup.panelAccess: false;
        }
        else{
            return false;
        }
    }

    /**
     * Returns the name of the default user group.
     */
    getDefaultGroup(): string {
        return this.defaultGroup;
    }

    /**
     * Returns if the name is an auth user group.
     * @param authGroup
     */
    isAuthGroup(authGroup: string): boolean {
        return this.authGroups.hasOwnProperty(authGroup);
    }

}

