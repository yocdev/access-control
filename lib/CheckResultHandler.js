"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckResultHandler = void 0;
class CheckResultHandler {
    constructor() {
        this.isAsync = false;
    }
    setAsync(isAsync) {
        this.isAsync = isAsync;
    }
}
exports.CheckResultHandler = CheckResultHandler;
