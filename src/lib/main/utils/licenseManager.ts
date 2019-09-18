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
     * type
     */
    t : LicenseType,
    /**
     * Indicates if the license is a multi-license,
     * the maximal amount of instances which are allowed and if it is cluster dependent.
     * FirstValue (Is multi-license and maximal amount)
     * 0 = no multi-license
     * -1 = multi-license with unlimited amount.
     * number > 0 = multi-license with a specific max amount.
     * SecondValue (Is cluster dependent)
     * 0 = no
     * 1 = yes
     */
    m : [number,number],
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

export enum LicenseType {
    Standard
}

const publicKey = 'EOS5u8AB78h1dRCBBae2k2x8kWFmTaWad3NmK5VGtgGNpX88XBVDn';

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
}