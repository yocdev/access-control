"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessPass = exports.CheckResult = void 0;
const lodash_1 = require("lodash");
var CheckResult;
(function (CheckResult) {
    CheckResult["Deny"] = "Deny";
    CheckResult["Skip"] = "Skip";
    CheckResult["Pass"] = "Pass";
})(CheckResult = exports.CheckResult || (exports.CheckResult = {}));
class AccessPass {
    constructor(initial) {
        this.filters = [];
        this.members = [];
        const { filter, key, name, priority, checkResult } = initial;
        this.name = name;
        this.filter = filter;
        this.key = key;
        this.priority = priority;
        this.checkResult = checkResult;
    }
    getMembers() {
        return Promise.resolve(this.members);
    }
    hasMember(member) {
        return Promise.resolve(this.members.includes(member));
    }
    addMembers(members) {
        members.forEach(it => {
            this.members.push(it);
        });
        return Promise.resolve();
    }
    removeMembers(members) {
        this.members = lodash_1.difference(this.members, members);
        return Promise.resolve();
    }
    parseFilter(allFilters) {
        const filters = [];
        this.filter.split('|').forEach(it => {
            const [name, ...args] = it.trim().split(' ');
            const Filter = allFilters[name];
            if (Filter) {
                filters.push(new Filter(args));
            }
        });
        this.filters = filters;
    }
    async check(request) {
        if (this.filters.length === 0) {
            return CheckResult.Pass;
        }
        let value = request;
        for (const filter of this.filters) {
            value = filter.filter(value);
        }
        if (value) {
            if (await this.hasMember(value)) {
                return this.checkResult;
            }
        }
        return CheckResult.Pass;
    }
}
exports.AccessPass = AccessPass;
