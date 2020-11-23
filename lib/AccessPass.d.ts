import { Filter } from './filters';
export declare enum CheckResult {
    Deny = "Deny",
    Skip = "Skip",
    Pass = "Pass"
}
export declare type AccessPassType = {
    name: string;
    key: string;
    filter: string;
    priority: number;
    checkResult: CheckResult;
};
export declare abstract class AccessPass implements AccessPassType {
    filter: string;
    key: string;
    name: string;
    priority: number;
    checkResult: CheckResult;
    filters: Filter[];
    protected members: string[];
    constructor(initial: AccessPassType);
    abstract updateMembers(): Promise<void>;
    getMembers(): Promise<string[]>;
    hasMember(member: string): Promise<boolean>;
    addMembers(members: string[]): Promise<void>;
    removeMembers(members: string[]): Promise<void>;
    parseFilter(allFilters: {
        [name: string]: new (args: string[]) => Filter;
    }): void;
    check(request: unknown): Promise<CheckResult>;
}
