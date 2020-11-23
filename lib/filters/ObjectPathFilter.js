"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectPathFilter = void 0;
const lodash_1 = require("lodash");
const Filter_1 = require("./Filter");
class ObjectPathFilter extends Filter_1.Filter {
    constructor(args) {
        super('get', args);
    }
    filter(value) {
        const [path] = this.args;
        if (this.isObject(value)) {
            return lodash_1.get(value, path);
        }
        return null;
    }
}
exports.ObjectPathFilter = ObjectPathFilter;
