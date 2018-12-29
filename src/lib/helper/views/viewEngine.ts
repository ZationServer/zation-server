/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

const path : any           = require('path');
import fs                  = require('fs');

class ViewEngine
{
    private defaultZationView : string;

    loadViews() : void {
        this.defaultZationView = this.load('zationDefault');
    }

    // noinspection JSMethodCanBeStatic
    private load(name : string) : string {
        return fs.readFileSync
        (path.resolve(__dirname + '/html/' + name + '.html'), 'utf8');
    }

    public getZationDefaultView() : string {
        return this.defaultZationView;
    }
}

export = ViewEngine;