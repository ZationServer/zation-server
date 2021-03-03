/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

type TaskRunner<T> = () => Promise<T>;
interface PendingTask<T> {
    runner: TaskRunner<T>,
    resolve: (res: T) => void;
    reject: (err: any) => void;
}

class MidTaskScheduler {

    private pendingTasks: PendingTask<any>[] = [];
    private runningTasksCount: number = 0;

    private pendingMidTasks: PendingTask<any>[] = [];
    private runningMidTasksCount: number = 0;

    private _taskFinish() {
        this.runningTasksCount--;
        this.tryRunMidTasks();
    }
    private _taskFinishBound: MidTaskScheduler['_taskFinish'] = this._taskFinish.bind(this);

    private _midTaskFinish() {
        this.runningMidTasksCount--;
        this.tryRunTasks();
    }
    private _midTaskFinishBound: MidTaskScheduler['_midTaskFinish'] = this._midTaskFinish.bind(this);

    private allowToRunTask(): boolean {
        return this.pendingMidTasks.length <= 0 && this.runningMidTasksCount <= 0;
    }

    private allowToRunMidTask(): boolean {
        return this.runningTasksCount <= 0;
    }

    async scheduleTask<T>(task: TaskRunner<T>) {
        if(this.allowToRunTask()) {
            this.runningTasksCount++;
            const promise = task();
            promise.finally(this._taskFinishBound)
            return promise;
        }
        else {
            const pendingTask: Partial<PendingTask<T>> = {runner: task};
            const promise = new Promise<T>(async (resolve, reject) => {
                pendingTask.resolve = resolve;
                pendingTask.reject = reject;
            })
            this.pendingTasks.push(pendingTask as PendingTask<T>);
            return promise;
        }
    }

    async scheduleMidTask<T>(task: TaskRunner<T>) {
        if(this.allowToRunMidTask()) {
            this.runningMidTasksCount++;
            const promise = task();
            promise.finally(this._midTaskFinishBound)
            return promise;
        }
        else {
            const pendingTask: Partial<PendingTask<T>> = {runner: task};
            const promise = new Promise<T>(async (resolve, reject) => {
                pendingTask.resolve = resolve;
                pendingTask.reject = reject;
            })
            this.pendingMidTasks.push(pendingTask as PendingTask<T>);
            return promise;
        }
    }

    private run(pendingTasks: PendingTask<any>[], taskFinishHandler: () => void) {
        pendingTasks.map(task => {
            const p = task.runner();
            p.finally(taskFinishHandler);
            p.then(task.resolve,task.reject);
        });
    }

    private tryRunMidTasks() {
        if(!this.allowToRunMidTask() || this.pendingMidTasks.length <= 0) return;

        const tasks: PendingTask<any>[] = this.pendingMidTasks;
        this.pendingMidTasks = [];
        this.runningMidTasksCount+= tasks.length;
        this.run(tasks,this._midTaskFinishBound);
    }

    private tryRunTasks() {
        if(!this.allowToRunTask() || this.pendingTasks.length <= 0) return;

        const tasks: PendingTask<any>[] = this.pendingTasks;
        this.pendingTasks = [];
        this.runningTasksCount+= tasks.length;
        this.run(tasks,this._taskFinishBound);
    }
}