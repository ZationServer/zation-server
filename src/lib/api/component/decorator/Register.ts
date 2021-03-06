/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Config           from "../../Config";
import Controller       from "../../Controller";
import Databox          from "../../databox/Databox";
import DataboxFamily    from "../../databox/DataboxFamily";
import ConfigBuildError from "../../../main/config/manager/configBuildError";
import {ComponentClass} from '../Component';
import Channel          from '../../channel/Channel';
import ChannelFamily    from '../../channel/ChannelFamily';
import Receiver         from '../../Receiver';
import ComponentUtils   from '../../../main/component/componentUtils';

/**
 * Register a component (Controller, Receiver, Channel or Databox).
 * You only have to import the file in the app config.
 * You are able to register multiple components with the same
 * type and identifier but different API levels.
 * The identifier of the component will be created with the name of the component.
 * The register decorator parses the name and API level from the class name.
 * You need to follow a specific name convention, see the code examples.
 * But you are able to override the parsed name and API level
 * with the first parameter of this decorator.
 * @example
 * Example 1:
 * class SendMessageController extends Controller {}
 * Parsed: name = sendMessage, apiLevel = undefined
 *
 * Example 2:
 * class RemoveItem extends Controller {}
 * Parsed: name = removeItem, apiLevel = undefined
 *
 * Example 3:
 * class BlockUserController_4 extends Controller {}
 * Parsed: name = blockUser, apiLevel = 4
 *
 * Example 4:
 * class AddItem_4 extends Controller {}
 * Parsed: name = addItem, apiLevel = 4
 *
 * Example 5:
 * class ProfileDatabox_13 extends DataboxFamily {}
 * Parsed: name = profile, apiLevel = 13
 *
 * Example 6:
 * class ProfileChannel_5 extends ChannelFamily {}
 * Parsed: name = profile, apiLevel = 5
 *
 * Example 7:
 * class MoveReceiver extends Receiver {}
 * Parsed: name = move, apiLevel = undefined
 * @param override
 * The parameter to override the parsed name and API level from the class name.
 */
export const Register = (override: {name?: string, apiLevel?: number | null} = {}): (target: ComponentClass) => void => {
    return (target: ComponentClass) => {
        if(target.prototype instanceof Controller || target.prototype instanceof Receiver ||
            target.prototype instanceof Databox || target.prototype instanceof DataboxFamily ||
            target.prototype instanceof Channel || target.prototype instanceof ChannelFamily){

            let {name,apiLevel} = ComponentUtils.parseClassName(target.name);
            if(override.name !== undefined){
                name = override.name;
            }
            if(override.apiLevel !== undefined){
                apiLevel = override.apiLevel === null ? undefined : parseInt(override.apiLevel as any);
            }

            ComponentUtils.checkName(name);
            Config.registerComponent(name,target,apiLevel);
        }
        else {
            throw new ConfigBuildError(`The register decorator can only be used on classes that extend the Controller, Receiver, Channel, ChannelFamily, Databox or DataboxFamily class.`);
        }
    };
};