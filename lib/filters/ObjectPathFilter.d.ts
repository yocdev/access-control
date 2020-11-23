import { Filter } from './Filter';
export declare class ObjectPathFilter extends Filter {
    constructor(args: string[]);
    filter(value: unknown): unknown;
}
