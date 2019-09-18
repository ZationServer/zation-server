/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import * as ecc     from 'eosjs-ecc';
import ZationMaster from "../../core/zationMaster";

export interface License {
    /**
     * name
     */
    n : string,
    /**
     * email
     */
    e : string,
    /**
     * level
     */
    l : LicenseLevel,
    /**
     * type
     */
    t : LicenseType
    /**
     * Max instances
     * The maximal amount of instances which are allowed.
     * -1 = unlimited amount.
     * number > 0 = specific max amount.
     */
    mi : number,
    /**
     * version
     */
    v : number,
    /**
     * id
     */
    i : string,
    /**
     * created timestamp
     */
    c : number
}

export enum LicenseLevel {
    Standard
}

export enum LicenseType {
    Single,
    Cluster,
    Multi
}

const publicKey = 'EOS6MHxuXnrdZMDiBVdyDqCKjBqDtJCD5ED1CFD3wkZuWojfqoUZZ';

export default class LicenseManager {
    private constructor(){}

    static processLicense(license : string) : License {
        try {
            const encodedBase64 = Buffer.from(license,'base64').toString('utf8');
            const splitSignIndex = encodedBase64.indexOf('#');
            const signature = encodedBase64.substr(0,splitSignIndex);
            const jsonData = encodedBase64.substr(splitSignIndex+1);

            if(ecc.verify(signature, jsonData, publicKey,'utf8',true)){
                return JSON.parse(jsonData) as License;
            }
        }
        catch (e) {}
        throw new Error('Invalid License');
    }

    static licenseVersionValid(license : License) : boolean {
        return license.v >= ZationMaster.minLicenseVersionRequired;
    }

    static licenseTypeToString(license : License) : string {
        const maxInstance =
            `(${license.mi === -1 ? 'Unlimited instances' : `Max ${license.mi} instance${license.mi > 1 ? 's' : ''}`})`;
        return `${LicenseType[license.t]} License ${maxInstance}`;
    }

    static licenseToMeta(license : License) : string {
        return `${license.i}#${license.l}.${license.t}.${license.mi}`;
    }
}