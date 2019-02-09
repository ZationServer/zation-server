/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

export default interface BagExtension<SB = Record<string,Function>,B = Record<string,Function>> {
    smallBag : SB,
    bag : B
}