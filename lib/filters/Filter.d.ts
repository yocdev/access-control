export declare abstract class Filter {
    name: string;
    args: string[];
    protected constructor(name: string, args: string[]);
    abstract filter(value: unknown): unknown;
    protected isString(value: unknown): value is string;
    protected isObject(value: unknown): value is any;
}
