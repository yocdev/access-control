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
        this.startUpdateCheckResultHandlers();
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
                it.setAsync(this.isAsync);
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
            this.checkResultHandlers.forEach(it => it.setAsync(this.isAsync));
        })
            .catch(e => {
            this.logger.error('update check result handlers error', e);
        });
    }
    check(request, response) {
        if (this.isAsync) {
            const checked = [];
            for (const accessPass of this.accessPasses) {
                const checkResultPromise = accessPass.check(request);
                checked.push(checkResultPromise.then(result => ({ key: accessPass.key, result })));
            }
            return Promise.all(checked)
                .then(results => {
                const checkResult = {};
                results.forEach(({ key, result }) => {
                    checkResult[key] = result;
                });
                return checkResult;
            })
                .then(checkResult => {
                const handleResults = [];
                for (const handler of this.checkResultHandlers) {
                    handleResults.push(handler.handle(request, response, checkResult));
                }
                return Promise.all(handleResults).then(it => it.some(Boolean));
            });
        }
        else {
            const checkResult = {};
            for (const accessPass of this.accessPasses) {
                checkResult[accessPass.key] = accessPass.check(request);
            }
            for (const handler of this.checkResultHandlers) {
                const handlerResult = handler.handle(request, response, checkResult);
                if (handlerResult) {
                    return true;
                }
            }
            return false;
        }
    }
}
exports.AccessPassService = AccessPassService;
