"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessPass = void 0;
const lodash_1 = require("lodash");
class AccessPass {
    constructor(initial) {
        this.filters = [];
        this.members = [];
        const { filter, key, name } = initial;
        this.name = name;
        this.filter = filter;
        this.key = key;
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
    check(request) {
        if (this.filters.length === 0) {
            return Promise.resolve(false);
        }
        let value = request;
        for (const filter of this.filters) {
            value = filter.filter(value);
        }
        if (value) {
            return this.hasMember(value);
        }
        return Promise.resolve(false);
    }
}
exports.AccessPass = AccessPass;
