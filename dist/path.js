"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intersection = exports.isChildOf = exports.fromNodeList = exports.contains = exports.last = exports.init = exports.tail = exports.head = exports.size = exports.root = void 0;
exports.root = '';
const size = (path) => path.length / 2;
exports.size = size;
const head = (path) => path.slice(0, 2);
exports.head = head;
const tail = (path) => path.slice(2);
exports.tail = tail;
const init = (path) => path.slice(0, -2);
exports.init = init;
const last = (path) => path.slice(-2);
exports.last = last;
const contains = (p1, p2) => p1.startsWith(p2);
exports.contains = contains;
const fromNodeList = (nodes) => {
    const len = nodes.length;
    if (len === 0)
        return '';
    if (len === 1)
        return nodes[0].id;
    const parts = new Array(len);
    for (let i = 0; i < len; i++) {
        parts[i] = nodes[i].id;
    }
    return parts.join('');
};
exports.fromNodeList = fromNodeList;
const isChildOf = (child, parent) => !!child && child.length === parent.length + 2 && child.startsWith(parent);
exports.isChildOf = isChildOf;
const intersection = (p1, p2) => {
    const minLen = Math.min(p1.length, p2.length);
    let commonLen = 0;
    for (let i = 0; i < minLen; i += 2) {
        if (p1.charCodeAt(i) === p2.charCodeAt(i) && p1.charCodeAt(i + 1) === p2.charCodeAt(i + 1)) {
            commonLen += 2;
        }
        else {
            break;
        }
    }
    return commonLen > 0 ? p1.slice(0, commonLen) : '';
};
exports.intersection = intersection;
