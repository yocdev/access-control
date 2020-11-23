import { Filter } from './Filter';
export declare class JsonFilter extends Filter {
    constructor(args: string[]);
    filter(value: unknown): unknown;
}
