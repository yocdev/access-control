import { Filter } from './Filter';
export declare class MatchFilter extends Filter {
    private readonly regExp;
    constructor(args: string[]);
    filter(value: unknown): unknown;
}
