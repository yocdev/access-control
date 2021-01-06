import { Filter } from './filters';
import { AccessPass } from './AccessPass';
import { CheckResultHandler } from './CheckResultHandler';
export declare type Filters = {
    [name: string]: new (args: string[]) => Filter;
};
declare type Options = {
    updateAccessPassesInterval: number;
    updateAccessPassMembersInterval: number;
    updateCheckResultHandlersInterval: number;
};
declare type LogFunction = (...args: unknown[]) => void;
export declare type Logger = {
    trace: LogFunction;
    debug: LogFunction;
    info: LogFunction;
    warn: LogFunction;
    error: LogFunction;
    fatal: LogFunction;
};
export declare abstract class AccessPassService<Request, Response> {
    abstract extensionFilters?: Filters;
    abstract logger: Logger;
    abstract getAccessPasses(): Promise<AccessPass<Request>[]>;
    abstract getCheckResultHandlers(): Promise<CheckResultHandler<Request, Response>[]>;
    abstract readonly isAsync: boolean;
    private defaultFilters;
    accessPasses: AccessPass<Request>[];
    checkResultHandlers: CheckResultHandler<Request, Response>[];
    private options;
    private stopped;
    constructor(options: Options);
    get filters(): Filters;
    start(): void;
    stop(): void;
    startUpdateAccessPasses(): void;
    startUpdateAccessPassMembers(): void;
    startUpdateCheckResultHandlers(): void;
    updateAccessPasses(): void;
    updateAccessPassMembers(): void;
    updateCheckResultHandlers(): void;
    check(request: Request, response: Response): Promise<boolean> | boolean;
}
export {};
