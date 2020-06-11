/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

// noinspection ES6PreferShortImport
import {RawSocket} from "../sc/socket";

export type SocketAction = (socket: RawSocket) => void;