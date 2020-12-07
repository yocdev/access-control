"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessPassService = void 0;
const lodash_1 = require("lodash");
const filters_1 = require("./filters");
class AccessPassService {
    constructor(options) {
        this.defaultFilters = {
            json: filters_1.JsonFilter,
            match: filters_1.MatchFilter,
            get: filters_1.ObjectPathFilter,
        };
        this.accessPasses = [];
        this.checkResultHandlers = [];
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
    startUpdateCheckResultHandlers() {
        if (this.stopped) {
            return;
        }
        this.updateCheckResultHandlers();
        if (this.options.updateCheckResultHandlersInterval) {
            setTimeout(() => {
                this.startUpdateCheckResultHandlers();
            }, this.options.updateCheckResultHandlersInterval);
        }
    }
    updateAccessPasses() {
        this.getAccessPasses()
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
    updateCheckResultHandlers() {
        this.getCheckResultHandlers()
            .then(handlers => {
            this.checkResultHandlers = handlers;
        })
            .catch(e => {
            this.logger.error('update check result handlers error', e);
        });
    }
    async check(request, response) {
        const checkResult = {};
        const checked = [];
        for (const accessPass of this.accessPasses) {
            checked.push(accessPass.check(request).then(result => ({ key: accessPass.key, result })));
        }
        const results = await Promise.all(checked);
        results.forEach(({ key, result }) => {
            checkResult[key] = result;
        });
        const handleResults = [];
        for (const handler of this.checkResultHandlers) {
            handleResults.push(handler.handle(request, response, checkResult));
        }
        return Promise.all(handleResults).then(it => it.some(Boolean));
    }
}
exports.AccessPassService = AccessPassService;
