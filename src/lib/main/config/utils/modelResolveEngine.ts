/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ModelOptional} from "../definitions/inputConfig";
import ResolveUtils    from "./resolveUtils";

export default class ModelResolveEngine
{
    private _tmpCreatedModels : object = {req : {},op : {}};

    private readonly models : object;

    constructor(models : object = {}) {
        this.models = models;
    }

    static correctSyntax(importDefinition : string) : boolean {
        return !!importDefinition.match(/^([or].)?[a-zA-Z0-9-/_]*$/);
    }

    /**
     * Try to get the is op info of resolved import of final level.
     * @param importDefinition
     */
    fullCheckIsOp(importDefinition : string) : boolean
    {
        let {exist,linkedValue,isOp} = this.peakCheck(importDefinition);
        const keys : string[] = [];
        while(exist && isOp === null && typeof linkedValue === 'string' && !keys.includes(linkedValue)) {
            keys.push(linkedValue);
            const newRes = this.peakCheck(linkedValue);
            exist=newRes.exist;
            linkedValue = newRes.linkedValue;
        }
        if(isOp !== null){
            return isOp;
        }
        else {
            throw new Error('can not resolve link.');
        }
    }

    /**
     * Only returns info for resolved import to first level.
     * @param importDefinition
     */
    peakCheck(importDefinition : string) : {exist : boolean,name : string,isOp : boolean | null,linkedValue : object | string | any[] | undefined}
    {
        let isOp : boolean | null = null;

        if(importDefinition.indexOf('o.') !== -1) {
            isOp = true;
            importDefinition = importDefinition.replace('o.','');
        }
        else if(importDefinition.indexOf('r.') !== -1) {
            isOp = false;
            importDefinition = importDefinition.replace('r.','');
        }
        return {
            exist : this.models.hasOwnProperty(importDefinition),
            linkedValue : this.models[importDefinition],
            name : importDefinition,
            isOp : this.tryCheckOptional(isOp,this.models,importDefinition)
        };
    }

    // noinspection JSMethodCanBeStatic
    private tryCheckOptional(isOp : boolean | null,mainConfig : object,name : string) : boolean | null
    {
        if(isOp === null) {
            //is not working if value is another link.
            isOp = (typeof mainConfig[name] === 'object' &&
                typeof mainConfig[name][nameof<ModelOptional>(s => s.isOptional)] === 'boolean' &&
                mainConfig[name][nameof<ModelOptional>(s => s.isOptional)]);
        }
        return isOp;
    }

    /**
     * Try to resolves extension to final level.
     * Throws in error if circle loop.
     * @param extendValue
     */
    tryExtendsResolveCheck(extendValue : object | string) : {value : any,keyPath : string[]} {
        const keys : string[] = [name];
        let v = extendValue;
        while (true) {
            const typeV = typeof v;
            if(typeV === 'string'){
                if(!keys.includes(v as string)) {
                    if(this.models.hasOwnProperty(v as string)){
                        keys.push(v as string);
                        v = this.models[v as string];
                    }
                    else {
                        throw new Error('Resolve Error');
                    }
                }
                else {
                    throw new Error('Circle Loop!');
                }
            }
            else if(typeV === 'object' || typeV === 'function') {
                v = ResolveUtils.modelResolveCheck(v);
                if(typeof v !== 'string'){
                    break;
                }
            }
            else {
                throw new Error('Unknown type');
            }
        }
        return {value : v,keyPath : keys};
    }

    /**
     * Resolves extension to final level.
     * Only use after config circle check with no errors.
     * @param value
     */
    extendsResolve(value : string | object) : any {
        if(typeof value !== "string"){
            value = ResolveUtils.modelResolveCheck(value);
        }
        else {
            value = this.models[value];
        }
        return typeof value === 'string' ? this.extendsResolve(value) : value;
    }

    /**
     * Resolves the import to final level.
     * Only use after config circle check with no errors.
     * @param importDefinition
     */
    resolve(importDefinition : string) : object
    {
        let isReq : boolean | null = null;

        if(importDefinition.indexOf('o.') !== -1) {
            isReq = false;
            importDefinition = importDefinition.replace('o.','');
        }
        else if(importDefinition.indexOf('r.') !== -1) {
            isReq = true;
            importDefinition = importDefinition.replace('r.','');
        }

        return this.mainResolve(
            isReq,
            importDefinition
        );
    }

    // noinspection JSMethodCanBeStatic
    private mainResolve(isReq : boolean | null,name : string) : object
    {
        const obj = this.models[name];

        if(typeof obj === 'string'){
            //import chain
            //is checked in configChecker for circular import, that this will not create an infinite loop.
            return this.resolve(obj);
        }

        if
        (
            isReq === null ||
            obj[nameof<ModelOptional>(s => s.isOptional)] === !isReq ||
            (obj[nameof<ModelOptional>(s => s.isOptional)] === undefined && isReq)
        ) {
            return this.models[name];
        }
        else {
            const key = isReq ? 'req' : 'op';
            const tmp = this._tmpCreatedModels[key][name];
            if(tmp){
                return tmp;
            }
            else {
                const obj = {...this.models[name]};
                obj[nameof<ModelOptional>(s => s.isOptional)] = !isReq;
                this._tmpCreatedModels[key][name] = obj;
                return obj;
            }
        }
    }

    get tmpCreatedModels(): object {
        return this._tmpCreatedModels;
    }
}

