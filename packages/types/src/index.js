"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIENT_ROLES = exports.INTERNAL_ROLES = void 0;
exports.isInternalRole = isInternalRole;
exports.isClientRole = isClientRole;
exports.INTERNAL_ROLES = [
    'owner',
    'admin',
    'sales',
    'pm',
    'tech',
    'readonly',
];
exports.CLIENT_ROLES = [
    'client_primary',
    'client_user',
];
function isInternalRole(role) {
    return exports.INTERNAL_ROLES.includes(role);
}
function isClientRole(role) {
    return exports.CLIENT_ROLES.includes(role);
}
//# sourceMappingURL=index.js.map