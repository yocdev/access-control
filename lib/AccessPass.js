"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessPass = void 0;
const lodash_1 = require("lodash");
class AccessPass {
    constructor(initial, isAsync) {
        this.filters = [];
        this.members = [];
        const { filter, key, name } = initial;
        this.name = name;
        this.filter = filter;
        this.key = key;
        this.isAsync = isAsync;
    }
    getMembers() {
        if (this.isAsync) {
            return Promise.resolve(this.members);
        }
        return this.members;
    }
    hasMember(member) {
        if (this.isAsync) {
            return Promise.resolve(this.members.includes(member));
        }
        return this.members.includes(member);
    }
    addMembers(members) {
        members.forEach(it => {
            this.members.push(it);
        });
        if (this.isAsync) {
            return Promise.resolve();
        }
        return undefined;
    }
    removeMembers(members) {
        this.members = lodash_1.difference(this.members, members);
        if (this.isAsync) {
            return Promise.resolve();
        }
        return undefined;
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
            if (this.isAsync) {
                return Promise.resolve(false);
            }
            return false;
        }
        let value = request;
        for (const filter of this.filters) {
            value = filter.filter(value);
        }
        if (value) {
            return this.hasMember(value);
        }
        if (this.isAsync) {
            return Promise.resolve(false);
        }
        return false;
    }
}
exports.AccessPass = AccessPass;
