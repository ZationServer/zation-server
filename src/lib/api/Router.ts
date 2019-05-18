/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {ControllerClass} from "./Controller";
import Config            from "./Config";

/**
 * A simple router class where you can create routes for controllers.
 */
export default class Router {

    private readonly route : string = '';

    /**
     * Create a controller router for a specific route.
     * Notice that the route split sign is a slash ('/') it will automatically be added to your route.
     * You also can optionally pass in a pre router.
     * @param route
     * @param router
     */
    constructor(route : string, router ?: Router){
        if(router){
            this.route += router.getRoute();
        }
        if(route[route.length-1] !== '/'){
            route+='/';
        }
        this.route += route;
    }

    /**
     * Returns the full route of this router.
     */
    getRoute() : string {
        return this.route;
    }

    /**
     * Attach a controller to this route.
     * It will automatically register the controller in the app config with the specific route.
     * You only have to import the file in the app config.
     * You can attach multiple controllers with the same name but different API levels.
     * @param name
     * @param controllerClass
     * @param apiLevel
     */
    attach(name : string,controllerClass : ControllerClass,apiLevel ?: number) {
        Config.registerController(this.route+name,controllerClass,apiLevel);
    }
}