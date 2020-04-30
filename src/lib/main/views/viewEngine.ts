/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import LicenseManager, {License} from "../utils/licenseManager";
const path: any                = require('path');
import fs                      = require('fs');

export default class ViewEngine
{
    private defaultZationView: string;
    private readonly license: License | undefined;
    private readonly instanceId: string;
    private readonly workerId: string;

    constructor(license: License | undefined,instanceId: string,workerId: string) {
        this.license = license;
        this.instanceId = instanceId;
        this.workerId = workerId;
    }

    async loadViews(): Promise<void> {
        let tmpDefaultView = await this.load('zationDefault');
        tmpDefaultView = this.template(tmpDefaultView,'licenseMeta',
            `<meta name="licenseMeta" content="${ this.license ? LicenseManager.licenseToMeta(this.license): '-'}">` );

        tmpDefaultView = this.template(tmpDefaultView,'instanceId',`<meta name="instanceId" content="${this.instanceId}">`);
        this.defaultZationView = this.template(tmpDefaultView,'workerId',`<meta name="workerId" content="${this.workerId}">`);
    }

    // noinspection JSMethodCanBeStatic
    private template(str: string, key: string, value: string): string {
        return str.replace(new RegExp(`{{${key}}}`, 'g'),value);
    }

    // noinspection JSMethodCanBeStatic
    private async load(name: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(path.resolve(__dirname + '/html/' + name + '.html'),'utf8', (err, data) => {
                err ? reject(err): resolve(data);
            });
        });
    }

    public getZationDefaultView(): string {
        return this.defaultZationView;
    }
}