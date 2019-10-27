/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import * as ecc     from 'eosjs-ecc';
import base64url    from "base64url";
import ZationMaster from "../../core/zationMaster";

export interface License {
    /**
     * holder
     */
    h : string,
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
            const decodedBase64 = base64url.decode(license);
            const splitSignIndex = decodedBase64.indexOf('#');
            const signature = decodedBase64.substr(0,splitSignIndex);
            const jsonData = decodedBase64.substr(splitSignIndex+1);

            if(ecc.verify(signature, jsonData, publicKey,'utf8',true)){
                const license = JSON.parse(jsonData) as License;
                if(LicenseType[license.t] !== undefined && LicenseLevel[license.l] !== undefined && license.mi > -2){
                    return license;
                }
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

    static licenseToPanelLicense(license : License) {
        return {
            ...license,
            l : LicenseLevel[license.l],
            t : LicenseType[license.t]
        };
    }
}