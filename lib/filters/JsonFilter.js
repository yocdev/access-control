"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonFilter = void 0;
const Filter_1 = require("./Filter");
class JsonFilter extends Filter_1.Filter {
    constructor(args) {
        super('json', args);
    }
    filter(value) {
        if (this.isString(value)) {
            try {
                return JSON.parse(value);
            }
            catch (_) {
                return null;
            }
        }
        return null;
    }
}
exports.JsonFilter = JsonFilter;
