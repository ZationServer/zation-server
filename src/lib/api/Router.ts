/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Config            from "./Config";
import {Component}       from "../main/config/definitions/parts/component";

/**
 * A simple router class where you can create routes for controllers.
 */
export default class Router {

    private readonly route: string = '';

    /**
     * Create a controller router for a specific route.
     * Notice that the route split sign is a slash ('/') it will automatically be added to your route.
     * You also can optionally pass in a pre router.
     * @param route
     * @param router
     */
    constructor(route: string, router?: Router){
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
    getRoute(): string {
        return this.route;
    }

    /**
     * Registers a component (Controller or Databox) with this route.
     * It will automatically register the component in the app config with the specific route.
     * You only have to import the file in the app config.
     * You can register multiple components with the same name but different API levels.
     * @param name
     * @param componentClass
     * @param apiLevel
     */
    register(name: string, componentClass: Component, apiLevel?: number) {
        Config.registerComponent(this.route+name,componentClass,apiLevel);
    }
}