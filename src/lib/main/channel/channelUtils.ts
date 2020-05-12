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
            const instance = ComponentUtils.getInstanceSafe(channels[i]);
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

}