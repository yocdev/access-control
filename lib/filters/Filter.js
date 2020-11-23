"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Filter = void 0;
const lodash_1 = require("lodash");
class Filter {
    constructor(name, args) {
        this.name = name;
        this.args = args;
    }
    isString(value) {
        return lodash_1.isString(value);
    }
    isObject(value) {
        return lodash_1.isObject(value);
    }
}
exports.Filter = Filter;
