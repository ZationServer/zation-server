/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import ComponentUtils                      from '../component/componentUtils';
import Channel, {ChannelClass}             from '../../api/channel/Channel';
import ChannelFamily, {ChannelFamilyClass} from '../../api/channel/ChannelFamily';
import ChannelFamilyContainer              from '../../api/channel/container/channelFamilyContainer';
import ChannelContainer                    from '../../api/channel/container/channelContainer';
import DynamicSingleton                    from '../utils/dynamicSingleton';
import {ClientErrorName}                   from '../definitions/clientErrorName';

export default class ChannelUtils {

    /**
     * A method that will load the instances from Channel classes
     * and will return the correct container for it.
     * @param channels
     */
    static getChContainer(channels: ChannelClass[] | ChannelFamilyClass[]): ChannelContainer | ChannelFamilyContainer {

        const chInstances: Channel[] = [];
        const chFamilyInstances: ChannelFamily[] = [];

        for(let i = 0; i < channels.length; i++){
            const instance = DynamicSingleton.getInstanceSafe(channels[i] as any);
            if(ComponentUtils.isFamily(instance)){
                chFamilyInstances.push(instance as ChannelFamily);
            }
            else {
                chInstances.push(instance as Channel);
            }
        }

        return chInstances.length > 0 ? (new ChannelContainer(chInstances))
            : (new ChannelFamilyContainer(chFamilyInstances));
    }

    /**
     * Checker for checking the max member limit,
     * it will throw an error to deny access.
     * @param current
     * @param max
     */
    static maxMembersCheck(current: number,max: number): void {
        if(current >= max){
            const err: any = new Error('Maximum members reached.');
            err.name = ClientErrorName.MaxMembersReached;
            throw err;
        }
    }

}