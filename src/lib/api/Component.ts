/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {extractComponentName} from '../main/utils/componentUtils';

export default class Component {

    /**
     * @description
     * The identifier of the Component from the app config.
     */
    protected readonly identifier: string;

    /**
     * @description
     * The name of the Component.
     */
    protected readonly name: string;

    /**
     * @description
     * The API level of the Component from the app config.
     * It can be undefined if no API level is defined.
     */
    protected readonly apiLevel: number | undefined;

    constructor(identifier: string, apiLevel: number | undefined) {
        this.identifier = identifier;
        this.name = extractComponentName(identifier);
        this.apiLevel = apiLevel;
    }
}