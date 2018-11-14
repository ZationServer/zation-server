/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import copyObject = require('copy-object');
import {PropertyOptional} from "../configs/appConfig";

class PropertyImportEngine
{
    private _tmpCreatedObjects : object = {req : {},op : {}};
    private _tmpCreatedValues : object = {req : {},op : {}};
    private _tmpCreatedArrays : object = {req : {},op : {}};

    private readonly objects : object;
    private readonly values : object;
    private readonly arrays : object;

    constructor(objects : object = {},values : object = {},arrays : object = {})
    {
        this.objects = objects;
        this.values = values;
        this.arrays = arrays;
    }

    static correctSyntax(importDefinition : string) : boolean {
        return !!importDefinition.match(/^([or]=>)?([ova].)?[a-zA-Z0-9-]*$/);
    }

    check(importDefinition : string) : {exist : boolean,type : string,name : string,isOp : boolean,obj : object | undefined}
    {
        let isOp : boolean | null = null;

        if(importDefinition.indexOf('o=>') !== -1) {
            isOp = true;
            importDefinition = importDefinition.replace('o=>','');
        }
        else if(importDefinition.indexOf('r=>') !== -1) {
            isOp = false;
            importDefinition = importDefinition.replace('r=>','');
        }

        if(importDefinition.indexOf('o.') !== -1) {
            const name = importDefinition.replace('o.','');
            return {
                exist : this.objects.hasOwnProperty(name),
                obj : this.objects[name],
                type : 'Object',
                name : name,
                isOp : this.checkOptional(isOp,this.objects,name)
            };
        }
        else if(importDefinition.indexOf('v.') !== -1) {
            const name = importDefinition.replace('v.','');
            return {
                exist : this.values.hasOwnProperty(name),
                obj : this.values[name],
                type : 'Value',
                name : name,
                isOp : this.checkOptional(isOp,this.values,name)
            };
        }
        else if(importDefinition.indexOf('a.') !== -1) {
            const name = importDefinition.replace('a.','');
            return {
                exist : this.arrays.hasOwnProperty(name),
                obj : this.arrays[name],
                type : 'Array',
                name : name,
                isOp : this.checkOptional(isOp,this.arrays,name)
            };
        }
        else {
            return {
                exist : this.objects.hasOwnProperty(importDefinition),
                obj : this.objects[importDefinition],
                type : 'Object',
                name : importDefinition,
                isOp : this.checkOptional(isOp,this.objects,importDefinition)
            };
        }
    }

    // noinspection JSMethodCanBeStatic
    private checkOptional(isOp : boolean | null,mainConfig : object,name : string) : boolean
    {
        if(isOp === null) {
            return (typeof mainConfig[name] === 'object' &&
                typeof mainConfig[name][nameof<PropertyOptional>(s => s.isOptional)] === 'boolean' &&
                mainConfig[name][nameof<PropertyOptional>(s => s.isOptional)]);
        }
        else {
            return isOp;
        }
    }

    resolve(importDefinition : string) : object
    {
        let isReq : boolean | null = null;

        if(importDefinition.indexOf('o=>') !== -1) {
            isReq = false;
            importDefinition = importDefinition.replace('o=>','');
        }
        else if(importDefinition.indexOf('r=>') !== -1) {
            isReq = true;
            importDefinition = importDefinition.replace('r=>','');
        }

        if(importDefinition.indexOf('o.') !== -1) {
            return this.mainResolve
            (
                isReq,
                importDefinition.replace('o.',''),
                this.objects,
                this._tmpCreatedObjects
            );
        }
        else if(importDefinition.indexOf('v.') !== -1) {
            return this.mainResolve
            (
                isReq,
                importDefinition.replace('v.',''),
                this.values,
                this._tmpCreatedValues
            );
        }
        else if(importDefinition.indexOf('a.') !== -1) {
            return this.mainResolve
            (
                isReq,
                importDefinition.replace('a.',''),
                this.arrays,
                this._tmpCreatedArrays
            );
        }
        else {
            return this.mainResolve
            (
                isReq,
                importDefinition,
                this.objects,
                this._tmpCreatedObjects
            );
        }
    }

    // noinspection JSMethodCanBeStatic
    private mainResolve(isReq : boolean | null,name : string,mainStorage : object,tmpStorage : object) : object
    {
        const obj = mainStorage[name];
        if
        (
            isReq === null ||
            obj[nameof<PropertyOptional>(s => s.isOptional)] === !isReq ||
            (obj[nameof<PropertyOptional>(s => s.isOptional)] === undefined && isReq)
        ) {
            return mainStorage[name];
        }
        else {
            const key = isReq ? 'req' : 'op';
            const tmp = tmpStorage[key][name];
            if(tmp){
                return tmp;
            }
            else {
                const obj = copyObject(mainStorage[name]);
                obj[nameof<PropertyOptional>(s => s.isOptional)] = !isReq;
                tmpStorage[key][name] = obj;
                return obj;
            }
        }
    }

    get tmpCreatedObjects(): object {
        return this._tmpCreatedObjects;
    }

    get tmpCreatedArrays(): object {
        return this._tmpCreatedArrays;
    }
}

export = PropertyImportEngine;