/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {License} from "../utils/licenseManager";

const path : any           = require('path');
import fs                  = require('fs');

export default class ViewEngine
{
    private defaultZationView : string;
    private license : License | undefined;

    constructor(license : License | undefined) {
        this.license = license;
    }

    async loadViews() : Promise<void> {
        const licenseMeta = this.license ?
            `<meta name="licenseMeta" content="${this.license.i}#${this.license.m[0]}.${this.license.m[1]}">` : undefined;
        this.defaultZationView = this.template((await this.load('zationDefault')),'licenseMeta',licenseMeta);
    }

    private template(str : string, key : string, value ?: string | number) : string {
        return str.replace
        (new RegExp(`{{${key}}}`, 'g'),value !== undefined ? ('\n' + value) : '');
    }

    // noinspection JSMethodCanBeStatic
    private async load(name : string) : Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(path.resolve(__dirname + '/html/' + name + '.html'),'utf8', (err, data) => {
                err ? reject(err) : resolve(data);
            });
        });
    }

    public getZationDefaultView() : string {
        return this.defaultZationView;
    }
}