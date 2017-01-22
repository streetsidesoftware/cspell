"use strict";
function asPromise(thenable) {
    return new Promise((resolve, reject) => {
        thenable.then(resolve, reject);
    });
}
exports.asPromise = asPromise;
//# sourceMappingURL=util.js.map