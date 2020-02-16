import {ChildProcess} from "child_process";

const cluster            = require('cluster');
const scErrors           = require('sc-errors');
const InvalidActionError = scErrors.InvalidActionError;
const ProcessExitError   = scErrors.ProcessExitError;

const workerInitOptions = JSON.parse((process.env.workerInitOptions as string));

class WorkerClusterController
{
    private static instance: WorkerClusterController;

    private workers: ChildProcess[];
    private hasExited: boolean = false;
    private terminatedCount: number = 0;
    private childExitLookup = {};
    private isTerminating: boolean = false;
    private isForceKillingWorkers: boolean = false;

    private processTermTimeout: number = 10000;
    private forceKillTimeout: number = 15000;
    private forceKillSignal: string = 'SIGHUP';

    constructor() {
        if (WorkerClusterController.instance) {
            // SCWorkerCluster is a singleton; it can only be instantiated once per process.
            throw new InvalidActionError('Attempted to instantiate a worker cluster which has already been instantiated');
        }
        WorkerClusterController.instance = this;

        this.register();
        this.init(workerInitOptions);
    }

    static create() {
        return new WorkerClusterController();
    }

    register()
    {
        process.on('disconnect', function () {
            process.exit();
        });

        process.on('message', (masterMessage) => {
            if (masterMessage.type == 'masterMessage' || masterMessage.type == 'masterResponse') {
                const targetWorker = this.workers[masterMessage.workerId];
                if (targetWorker) {
                    targetWorker.send(masterMessage);
                } else {
                    if (masterMessage.type == 'masterMessage') {
                        let errorMessage = 'Cannot send message to worker with id ' + masterMessage.workerId +
                            ' because the worker does not exist';

                        const notFoundError = new InvalidActionError(errorMessage);
                        WorkerClusterController.sendErrorToMaster(notFoundError);

                        if (masterMessage.cid) {
                            (process.send as any)({
                                type: 'workerClusterResponse',
                                error: scErrors.dehydrateError(notFoundError, true),
                                data: null,
                                workerId: masterMessage.workerId,
                                rid: masterMessage.cid
                            });
                        }
                    } else {
                        const errorMessage = 'Cannot send response to worker with id ' + masterMessage.workerId +
                            ' because the worker does not exist';

                        const notFoundError = new InvalidActionError(errorMessage);
                        WorkerClusterController.sendErrorToMaster(notFoundError);
                    }
                }
            } else {
                if (masterMessage.type == 'terminate') {
                    if (masterMessage.data.killClusterMaster) {
                        this.terminate(masterMessage.data.immediate);
                    } else {
                        this.killUnresponsiveWorkers();
                    }
                }
                (this.workers || []).forEach( (worker) => {
                    worker.send(masterMessage);
                });
            }
        });

        process.on('uncaughtException', (err) => {
            WorkerClusterController.sendErrorToMaster(err);
            process.exit(1);
        });
    }

    static sendErrorToMaster(err) {
        (process as any).send({
            type: 'error',
            data: {
                pid: process.pid,
                error: scErrors.dehydrateError(err, true)
            }
        });
    }

    killUnresponsiveWorkersNow()
    {
        (this.workers || []).forEach( (worker, i) => {
            if (!this.childExitLookup[i]) {
                process.kill((worker as any).process.pid, this.forceKillSignal);
                const errorMessage = 'No exit signal was received by worker with id ' + i +
                    ' (PID: ' + (worker as any).process.pid + ') before forceKillTimeout of ' + this.forceKillTimeout +
                    ' ms was reached - As a result, kill signal ' + this.forceKillSignal + ' was sent to worker';
                const processExitError = new ProcessExitError(errorMessage);
                WorkerClusterController.sendErrorToMaster(processExitError);
            }
        });
        this.isForceKillingWorkers = false;
    }

    killUnresponsiveWorkers() {
        this.childExitLookup = {};
        if (this.isForceKillingWorkers) {
            return;
        }
        this.isForceKillingWorkers = true;
        setTimeout( () => {
            this.killUnresponsiveWorkersNow();
        }, this.forceKillTimeout);
    }

    terminateNow() {
        if (!this.hasExited) {
            this.hasExited = true;
            process.exit();
        }
    }

    terminate(immediate){
        if (immediate) {
            this.terminateNow();
            return;
        }
        if (this.isTerminating) {
            return;
        }
        this.isTerminating = true;
        setTimeout( () => {
            this.terminateNow();
        }, this.processTermTimeout);
    }

    init(options: any)
    {
        if (options.schedulingPolicy != null) {
            cluster.schedulingPolicy = options.schedulingPolicy;
        }

        if (options.processTermTimeout != null) {
            this.processTermTimeout = options.processTermTimeout;
        }
        if (options.forceKillTimeout != null) {
            this.forceKillTimeout = options.forceKillTimeout;
        }
        if (options.forceKillSignal != null) {
            this.forceKillSignal = options.forceKillSignal;
        }

        cluster.setupMaster({
            exec: options.paths.appWorkerControllerPath
        });

        let workerCount = options.workerCount;
        let readyCount = 0;
        let isReady = false;
        this.workers = [];

        const launchWorker = (i, respawn = false) => {
            let workerInitOptions = options;
            workerInitOptions.id = i;

            const worker = cluster.fork({
                workerInitOptions: JSON.stringify(workerInitOptions),
                respawn
            });
            this.workers[i] = worker;

            worker.on('error', WorkerClusterController.sendErrorToMaster);

            worker.on('message',  (workerMessage) => {
                if (workerMessage.type == 'ready') {
                    (process.send as any)({
                        type: 'workerStart',
                        data: {
                            id: i,
                            pid: worker.process.pid,
                            respawn: respawn
                        }
                    });

                    if (!isReady && ++readyCount >= workerCount) {
                        isReady = true;
                        (process.send as any)({
                            type: 'ready'
                        });
                    }
                } else {
                    (process.send as any)(workerMessage);
                }
            });

            worker.on('exit',  (code, signal) => {
                this.childExitLookup[i] = true;
                if (!this.isTerminating) {
                    (process.send as any)({
                        type: 'workerExit',
                        data: {
                            id: i,
                            pid: worker.process.pid,
                            code: code,
                            signal: signal
                        }
                    });

                    if (options.rebootWorkerOnCrash) {
                        launchWorker(i, true);
                    }
                } else if (++this.terminatedCount >= this.workers.length) {
                    if (!this.hasExited) {
                        this.hasExited = true;
                        process.exit();
                    }
                }
            });
        };

        for (let i = 0; i < workerCount; i++) {
            launchWorker(i);
        }
    }
}

WorkerClusterController.create();

