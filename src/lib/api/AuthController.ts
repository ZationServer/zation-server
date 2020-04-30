/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Controller from './Controller';

/**
 * The AuthController is a specific type of a Controller that is used to authenticate the clients.
 * The controller is one of the main concepts of zation.
 * It followers the request-response principle.
 * The controller can be protected with lots of possibilities,
 * also it supports input validation by using defined models.
 * Additionally it is easy to return a result or a collection of errors to the client.
 * A controller should be used for determining an action that the
 * client can make e.g., login, register, or sendMessage.
 * It is recommended if you want to get data from the server to use a Databox instead of a
 * controller because it is much easier to use and provides the
 * functionality to keep the data up to date in real time.
 */
export default class AuthController extends Controller {}