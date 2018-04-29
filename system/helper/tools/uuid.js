/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

class UUID
{
    static generateUUID()
    {
        let d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function')
        {
            d += performance.now();
        }
        // noinspection SpellCheckingInspection
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,(c) =>
        {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
}

module.exports = UUID;