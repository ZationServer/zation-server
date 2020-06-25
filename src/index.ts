/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import BackError                    from "./lib/api/BackError";
import BackErrorBag                 from "./lib/api/BackErrorBag";
import Bag, {bag}                   from './lib/api/Bag';
import AuthController               from './lib/api/AuthController';
import Controller                   from './lib/api/Controller';
import Config                       from './lib/api/Config';
import BackErrorBuilder             from "./lib/main/builder/backErrorBuilder";
import ServiceNotFoundError         from './lib/main/services/serviceNotFoundError';
import AuthenticationRequiredError  from './lib/main/error/authenticationRequiredError';
import UndefinedUserIdError         from './lib/main/error/undefinedUserIdError';
import InputIsIncompatibleError     from './lib/main/error/inputIsIncompatibleError';
import CodeError                    from './lib/main/error/codeError';
import {ErrorType}                  from "./lib/main/definitions/errorType";
import {ValidationType}             from './lib/main/definitions/validationType';
import {ControllerConfig}           from "./lib/main/config/definitions/parts/controllerConfig";
import {StartMode}                  from "./lib/core/startMode";
import Router                       from "./lib/api/Router";
import {Register}                   from "./lib/api/component/decorator/Register";
import {$value, $key, $pair, $all, $any, $contains, $matches}   from './lib/api/databox/DbApiUtils';
import {$tokenPayloadIncludes, $tokenPayloadMatches, $userId}   from './lib/api/AccessApiUtils';
import {updateModelTranslatable}                  from './lib/api/configTranslatable/modelTranslatable';
import {updateInputConfigTranslatable}            from './lib/api/configTranslatable/inputConfigTranslatable';
import {Model}                      from "./lib/api/input/decorator/Model";
import {ObjectModel}                from "./lib/api/input/decorator/ObjectModel";
import {ParamInput}                 from "./lib/api/input/decorator/ParamInput";
import {Constructor}                from "./lib/api/input/decorator/Constructor";
import NoMoreDataAvailableError     from "./lib/main/databox/noMoreDataAvailable";
import DataboxFamily                from "./lib/api/databox/DataboxFamily";
import Databox                      from "./lib/api/databox/Databox";
import {DataboxConfig}              from "./lib/main/config/definitions/parts/databoxConfig";
import DataboxContainer             from "./lib/api/databox/container/databoxContainer";
import DataboxFamilyContainer       from "./lib/api/databox/container/databoxFamilyContainer";
import {buildKeyArray}              from "./lib/main/databox/dbKeyArrayUtils";
import Socket                       from "./lib/api/Socket";
import ZationToken                  from "./lib/main/internalApi/zationToken";
import ServerInfo                   from "./lib/main/internalApi/serverInfo";
import AsymmetricKeyPairs           from "./lib/main/internalApi/asymmetricKeyPairs";
import DbCudOperationSequence       from "./lib/main/databox/dbCudOperationSequence";
import {ObjectPathSequence}         from "./lib/main/internalApi/objectPathSequence/objectPathSequence";
import {StartErrorName}             from "./lib/main/definitions/startErrorName";
import NoDataAvailableError         from "./lib/main/databox/noDataAvailable";
import {$not}                       from './lib/api/Notable';
import {Server}                     from './lib/api/Server';
import BackErrorConstruct           from './lib/main/definitions/backErrorConstruct';
import {$init}                      from './lib/api/InitApiUtils';
import {start}                      from './lib/api/Start';
import {ConsoleColor}               from './lib/main/log/logCategories';
import {$optional}                  from './lib/api/input/Optional';
import {$models}                    from './lib/api/input/Models';
import {$model}                     from './lib/api/input/Model';
import {$extends}                   from './lib/api/input/Extends';
import {$single}                    from './lib/api/input/Single';
import {Events}                     from './lib/main/config/definitions/parts/events';
import {Middleware}                 from './lib/main/config/definitions/parts/middleware';
import Channel                      from './lib/api/channel/Channel';
import ChannelFamily                from './lib/api/channel/ChannelFamily';
import {ChannelConfig}              from './lib/main/config/definitions/parts/channelConfig';
import {ChannelInfo}                from './lib/main/channel/channelDefinitions';
import ChannelContainer             from './lib/api/channel/container/channelContainer';
import ChannelFamilyContainer       from './lib/api/channel/container/channelFamilyContainer';
import Receiver                     from './lib/api/Receiver';
import {ReceiverConfig}             from './lib/main/config/definitions/parts/receiverConfig';
import {RawSocket}                  from './lib/main/sc/socket';
import Packet                       from './lib/api/Packet';
import Inject                       from './lib/api/injections/decorator/Inject';
import Injectable                   from './lib/api/injections/Injectable';
import Initializer                  from './lib/api/Initializer';

//Refresh bag instance export
Bag._addReadyRefresher((bag) => exports.bag = bag);
export {
    start,
    StartMode,
    StartErrorName,
    Bag,
    bag,
    Router,
    Initializer,
    Inject,
    Injectable,
    Register,
    $not,
    $optional,
    $models,
    $model,
    $extends,
    Model,
    Constructor,
    ObjectModel,
    ParamInput,
    NoMoreDataAvailableError,
    NoDataAvailableError,
    DataboxFamily,
    DataboxFamilyContainer,
    Databox,
    DataboxContainer,
    DataboxConfig,
    Channel,
    ChannelContainer,
    ChannelFamily,
    ChannelFamilyContainer,
    ChannelConfig,
    $init,
    $key,
    $value,
    $pair,
    $all,
    $contains,
    $any,
    $matches,
    $userId,
    $tokenPayloadIncludes,
    $tokenPayloadMatches,
    AuthController,
    Controller,
    ControllerConfig,
    Receiver,
    ReceiverConfig,
    BackError,
    BackErrorBuilder,
    BackErrorBag,
    BackErrorConstruct,
    ErrorType,
    Server,
    Config,
    ServiceNotFoundError,
    ValidationType,
    AuthenticationRequiredError,
    UndefinedUserIdError,
    CodeError,
    InputIsIncompatibleError,
    $single,
    buildKeyArray,
    Socket,
    RawSocket,
    Packet,
    ZationToken,
    ServerInfo,
    ChannelInfo,
    AsymmetricKeyPairs,
    DbCudOperationSequence,
    ObjectPathSequence,
    ConsoleColor,
    Events,
    Middleware,
    updateModelTranslatable,
    updateInputConfigTranslatable
};