import { Filter } from './filters';
import { AccessPass, CheckResult } from './AccessPass';
export declare type Filters = {
    [name: string]: new (args: string[]) => Filter;
};
declare type Options = {
    updateAccessPassesInterval: number;
    updateAccessPassMembersInterval: number;
};
export declare abstract class AccessPassService {
    abstract extensionFilters?: Filters;
    abstract logger: any;
    abstract onFetchAccessPasses(): Promise<AccessPass[]>;
    private defaultFilters;
    accessPasses: AccessPass[];
    private options;
    private stopped;
    constructor(options: Options);
    get filters(): Filters;
    start(): void;
    stop(): void;
    startUpdateAccessPasses(): void;
    startUpdateAccessPassMembers(): void;
    updateAccessPasses(): void;
    updateAccessPassMembers(): void;
    check(request: unknown): Promise<CheckResult>;
}
export {};
