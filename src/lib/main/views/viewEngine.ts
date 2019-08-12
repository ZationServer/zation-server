/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const path : any           = require('path');
import fs                  = require('fs');

export default class ViewEngine
{
    private defaultZationView : string;

    async loadViews() : Promise<void> {
        this.defaultZationView = await this.load('zationDefault');
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