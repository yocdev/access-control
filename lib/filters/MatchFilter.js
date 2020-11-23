"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchFilter = void 0;
const Filter_1 = require("./Filter");
class MatchFilter extends Filter_1.Filter {
    constructor(args) {
        super('match', args);
        this.regExp = new RegExp(args[0]);
    }
    filter(value) {
        if (this.isString(value)) {
            const match = value.match(this.regExp);
            if (match) {
                return match[1] || null;
            }
        }
        return null;
    }
}
exports.MatchFilter = MatchFilter;
