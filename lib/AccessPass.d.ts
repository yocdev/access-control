import { Filter } from './filters';
export declare type AccessPassType = {
    name: string;
    key: string;
    filter: string;
};
export declare type PromiseOrValue<T> = Promise<T> | T;
export declare abstract class AccessPass<Request> implements AccessPassType {
    filter: string;
    key: string;
    name: string;
    filters: Filter[];
    readonly isAsync: boolean;
    protected members: string[];
    constructor(initial: AccessPassType, isAsync: boolean);
    abstract updateMembers(): Promise<void>;
    getMembers(): PromiseOrValue<string[]>;
    hasMember(member: string): PromiseOrValue<boolean>;
    addMembers(members: string[]): PromiseOrValue<void>;
    removeMembers(members: string[]): PromiseOrValue<void>;
    parseFilter(allFilters: {
        [name: string]: new (args: string[]) => Filter;
    }): void;
    check(request: Request): PromiseOrValue<boolean>;
}
