"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ops = exports.path = void 0;
exports.build = build;
const treePath = __importStar(require("./path"));
exports.path = treePath;
const ops = __importStar(require("./ops"));
exports.ops = ops;
const common_1 = require("./common");
function build(root) {
    const pathCache = new Map();
    const MAX_CACHE_SIZE = 64;
    const invalidateCache = () => {
        pathCache.clear();
    };
    const lastNode = () => ops.findInMainline(root, (node) => !node.children.length);
    function nodeAtPathDirect(rootNode, path) {
        if (path === '')
            return rootNode;
        const len = path.length;
        if (len % 2 !== 0)
            return undefined;
        let curr = rootNode;
        for (let i = 0; i < len; i += 2) {
            if (!curr)
                return undefined;
            const c0 = path.charCodeAt(i);
            const c1 = path.charCodeAt(i + 1);
            const children = curr.children;
            const cLen = children.length;
            let match = undefined;
            for (let j = 0; j < cLen; j++) {
                const child = children[j];
                if (child.id.charCodeAt(0) === c0 && child.id.charCodeAt(1) === c1) {
                    match = child;
                    break;
                }
            }
            curr = match;
        }
        return curr;
    }
    const nodeAtPathOrNull = (path) => {
        if (path === '')
            return root;
        const cached = pathCache.get(path);
        if (cached)
            return cached;
        const node = nodeAtPathDirect(root, path);
        if (node) {
            if (pathCache.size >= MAX_CACHE_SIZE) {
                pathCache.clear();
            }
            pathCache.set(path, node);
        }
        return node;
    };
    function longestValidPathFrom(rootNode, path) {
        if (!path)
            return '';
        const len = path.length;
        let curr = rootNode;
        let validLen = 0;
        for (let i = 0; i < len; i += 2) {
            if (!curr)
                break;
            const c0 = path.charCodeAt(i);
            const c1 = path.charCodeAt(i + 1);
            const children = curr.children;
            const cLen = children.length;
            let match = undefined;
            for (let j = 0; j < cLen; j++) {
                const child = children[j];
                if (child.id.charCodeAt(0) === c0 && child.id.charCodeAt(1) === c1) {
                    match = child;
                    break;
                }
            }
            if (match) {
                validLen += 2;
                curr = match;
            }
            else {
                break;
            }
        }
        return validLen > 0 ? path.slice(0, validLen) : '';
    }
    function getCurrentNodesAfterPly(nodeList, mainline, ply) {
        var _a;
        const nodes = [];
        const len = nodeList.length;
        for (let i = 0; i < len; i++) {
            const node = nodeList[i];
            if (node.ply <= ply && ((_a = mainline[i]) === null || _a === void 0 ? void 0 : _a.id) !== node.id)
                break;
            if (node.ply > ply)
                nodes.push(node);
        }
        return nodes;
    }
    function pathIsMainline(path) {
        if (path === '')
            return true;
        const len = path.length;
        let curr = root;
        for (let i = 0; i < len; i += 2) {
            if (!curr)
                return false;
            const firstChild = curr.children[0];
            if (!firstChild)
                return false;
            if (firstChild.id.charCodeAt(0) !== path.charCodeAt(i) ||
                firstChild.id.charCodeAt(1) !== path.charCodeAt(i + 1)) {
                return false;
            }
            curr = firstChild;
        }
        return true;
    }
    const pathExists = (path) => !!nodeAtPathOrNull(path);
    const pathIsForcedVariation = (path) => {
        const list = getNodeList(path);
        const len = list.length;
        for (let i = 0; i < len; i++) {
            if (list[i].forceVariation)
                return true;
        }
        return false;
    };
    function lastMainlineNodeFrom(rootNode, path) {
        if (path === '')
            return rootNode;
        const len = path.length;
        let curr = rootNode;
        for (let i = 0; i < len; i += 2) {
            const firstChild = curr.children[0];
            if (!firstChild)
                return curr;
            if (firstChild.id.charCodeAt(0) !== path.charCodeAt(i) ||
                firstChild.id.charCodeAt(1) !== path.charCodeAt(i + 1)) {
                return curr;
            }
            curr = firstChild;
        }
        return curr;
    }
    const getNodeList = (path) => {
        const nodes = [root];
        if (path === '')
            return nodes;
        const len = path.length;
        let curr = root;
        for (let i = 0; i < len; i += 2) {
            if (!curr)
                break;
            const c0 = path.charCodeAt(i);
            const c1 = path.charCodeAt(i + 1);
            const children = curr.children;
            const cLen = children.length;
            let match = undefined;
            for (let j = 0; j < cLen; j++) {
                const child = children[j];
                if (child.id.charCodeAt(0) === c0 && child.id.charCodeAt(1) === c1) {
                    match = child;
                    break;
                }
            }
            if (match) {
                nodes.push(match);
                curr = match;
            }
            else {
                break;
            }
        }
        return nodes;
    };
    const extendPath = (path, isMainline) => {
        let currNode = nodeAtPathOrNull(path);
        let extended = path;
        while ((currNode = currNode === null || currNode === void 0 ? void 0 : currNode.children[0]) && !(isMainline && currNode.forceVariation)) {
            extended += currNode.id;
        }
        return extended;
    };
    function updateAt(path, update) {
        const node = nodeAtPathOrNull(path);
        if (node) {
            update(node);
            invalidateCache();
        }
        return node;
    }
    // returns new path
    function addNode(node, path) {
        const newPath = path + node.id;
        const existing = nodeAtPathOrNull(newPath);
        if (existing) {
            const keys = ['dests', 'drops', 'clock'];
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if ((0, common_1.defined)(node[key]) && !(0, common_1.defined)(existing[key])) {
                    existing[key] = node[key];
                }
            }
            return newPath;
        }
        const res = updateAt(path, function (parent) {
            var _a;
            if ((_a = parent.children[0]) === null || _a === void 0 ? void 0 : _a.forceVariation) {
                parent.children[0].forceVariation = false;
                parent.children.unshift(node);
            }
            else
                parent.children.push(node);
        });
        if (res) {
            invalidateCache();
            return newPath;
        }
        return undefined;
    }
    function addNodes(nodes, path) {
        const node = nodes[0];
        if (!node)
            return path;
        const newPath = addNode(node, path);
        return newPath ? addNodes(nodes.slice(1), newPath) : undefined;
    }
    const deleteNodeAt = (path) => {
        const parent = parentNode(path);
        if (parent) {
            ops.removeChild(parent, treePath.last(path));
            invalidateCache();
        }
    };
    function promoteAt(path, toMainline) {
        var _a;
        const nodes = getNodeList(path);
        let changed = false;
        for (let i = nodes.length - 2; i >= 0; i--) {
            const node = nodes[i + 1];
            const parent = nodes[i];
            if (((_a = parent.children[0]) === null || _a === void 0 ? void 0 : _a.id) !== node.id) {
                ops.removeChild(parent, node.id);
                parent.children.unshift(node);
                changed = true;
                if (!toMainline)
                    break;
            }
            else if (node.forceVariation) {
                node.forceVariation = false;
                changed = true;
                if (!toMainline)
                    break;
            }
        }
        if (changed)
            invalidateCache();
    }
    const setCommentAt = (comment, path) => !comment.text
        ? deleteCommentAt(comment.id, path)
        : updateAt(path, node => {
            node.comments = node.comments || [];
            const existing = node.comments.find(function (c) {
                return c.id === comment.id;
            });
            if (existing)
                existing.text = comment.text;
            else
                node.comments.push(comment);
        });
    const deleteCommentAt = (id, path) => updateAt(path, node => {
        const comments = (node.comments || []).filter(c => c.id !== id);
        node.comments = comments.length ? comments : undefined;
    });
    const setGlyphsAt = (glyphs, path) => updateAt(path, node => {
        node.glyphs = glyphs;
    });
    const parentNode = (path) => nodeAtPathOrNull(treePath.init(path));
    const getParentClock = (node, path) => {
        const parent = parentNode(path);
        return parent ? parent.clock : node.clock;
    };
    function walkUntilTrue(fn, from = '', branchOnly = false) {
        function traverse(node, isMainline) {
            if (fn(node, isMainline))
                return true;
            let i = branchOnly ? 1 : 0;
            branchOnly = false;
            while (i < node.children.length) {
                const c = node.children[i];
                if (traverse(c, isMainline && i === 0 && !c.forceVariation))
                    return true;
                i++;
            }
            return false;
        }
        const n = nodeAtPathOrNull(from);
        return n ? traverse(n, pathIsMainline(from)) : false;
    }
    return {
        root,
        lastPly: () => { var _a; return ((_a = lastNode()) === null || _a === void 0 ? void 0 : _a.ply) || root.ply; },
        nodeAtPath: nodeAtPathOrNull,
        getNodeList,
        longestValidPath: (path) => longestValidPathFrom(root, path),
        updateAt,
        addNode,
        addNodes,
        addDests: (dests, path) => updateAt(path, (node) => {
            node.dests = dests;
        }),
        setShapes: (shapes, path) => updateAt(path, (node) => {
            node.shapes = shapes.slice();
        }),
        setCommentAt,
        deleteCommentAt,
        setGlyphsAt,
        setClockAt: (clock, path) => updateAt(path, node => {
            node.clock = clock;
        }),
        pathIsMainline,
        pathIsForcedVariation,
        lastMainlineNode: (path) => lastMainlineNodeFrom(root, path),
        extendPath,
        pathExists,
        deleteNodeAt,
        promoteAt,
        forceVariationAt: (path, force) => updateAt(path, node => {
            node.forceVariation = force;
        }),
        getCurrentNodesAfterPly,
        merge: (tree) => {
            ops.merge(root, tree);
            invalidateCache();
        },
        removeCeval: () => ops.updateAll(root, function (n) {
        }),
        parentNode,
        getParentClock,
        walkUntilTrue,
    };
}
