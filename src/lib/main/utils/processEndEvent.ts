/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

const listeners: (() => void)[] = [];
export function onProcessEnd(listener: () => void) {
    listeners.push(listener);
}

[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
    process.on(eventType as any,() => {
        for(let i = 0; i < listeners.length;i++){
            listeners[i]();
        }
    });
});