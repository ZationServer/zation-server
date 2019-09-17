/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import * as ecc from 'eosjs-ecc';

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
     * indicates if the license is a cluster license and the maximal amount of instances which are allowed.
     * 0 = no cluster license
     * -1 = cluster license with unlimited amount.
     * number > 0 = cluster license with his specific max amount.
     */
    cl : number,
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
}