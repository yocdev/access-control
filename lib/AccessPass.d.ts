import { Filter } from './filters';
export declare type AccessPassType = {
    name: string;
    key: string;
    filter: string;
};
export declare abstract class AccessPass<Request> implements AccessPassType {
    filter: string;
    key: string;
    name: string;
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
    check(request: Request): Promise<boolean>;
}
