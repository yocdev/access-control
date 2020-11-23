"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessPassService = void 0;
const lodash_1 = require("lodash");
const filters_1 = require("./filters");
const AccessPass_1 = require("./AccessPass");
class AccessPassService {
    constructor(options) {
        this.defaultFilters = {
            json: filters_1.JsonFilter,
            match: filters_1.MatchFilter,
            get: filters_1.ObjectPathFilter,
        };
        this.accessPasses = [];
        this.stopped = false;
        this.options = options;
    }
    get filters() {
        return Object.assign(Object.assign({}, this.defaultFilters), this.extensionFilters);
    }
    start() {
        this.stopped = false;
        this.startUpdateAccessPasses();
        this.startUpdateAccessPassMembers();
    }
    stop() {
        this.stopped = true;
    }
    startUpdateAccessPasses() {
        if (this.stopped) {
            return;
        }
        this.updateAccessPasses();
        if (this.options.updateAccessPassesInterval) {
            setTimeout(() => {
                this.startUpdateAccessPasses();
            }, this.options.updateAccessPassesInterval);
        }
    }
    startUpdateAccessPassMembers() {
        if (this.stopped) {
            return;
        }
        this.updateAccessPassMembers();
        if (this.options.updateAccessPassMembersInterval) {
            setTimeout(() => {
                this.startUpdateAccessPassMembers();
            }, this.options.updateAccessPassMembersInterval);
        }
    }
    updateAccessPasses() {
        this.onFetchAccessPasses()
            .then(passes => {
            this.accessPasses = lodash_1.orderBy(passes, ['priority'], ['desc']);
            this.accessPasses.forEach(it => {
                try {
                    it.parseFilter(this.filters);
                }
                catch (e) {
                    this.logger.error('parse filter error', {
                        accessMemberName: it.name,
                        accessMemberFilter: it.filter,
                        error: e,
                    });
                }
                it.updateMembers().catch(e => {
                    this.logger.error('update pass members error', {
                        accessMemberName: it.name,
                        error: e,
                    });
                });
            });
        })
            .catch(e => {
            this.logger.error('fetch access passes error', e);
        });
    }
    updateAccessPassMembers() {
        this.accessPasses.forEach(it => {
            it.updateMembers()
                .catch(e => {
                this.logger.error('update access pass member error', {
                    error: e,
                    accessMemberName: it.name,
                });
            });
        });
    }
    async check(request) {
        for (const accessPass of this.accessPasses) {
            const checkResult = await accessPass.check(request);
            if (checkResult === AccessPass_1.CheckResult.Skip) {
                return AccessPass_1.CheckResult.Skip;
            }
            if (checkResult === AccessPass_1.CheckResult.Deny) {
                return AccessPass_1.CheckResult.Deny;
            }
        }
        return AccessPass_1.CheckResult.Pass;
    }
}
exports.AccessPassService = AccessPassService;
