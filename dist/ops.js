"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainlineNodeList = exports.hasBranching = exports.last = void 0;
exports.withMainlineChild = withMainlineChild;
exports.findInMainline = findInMainline;
exports.collect = collect;
exports.childById = childById;
exports.nodeAtPly = nodeAtPly;
exports.takePathWhile = takePathWhile;
exports.removeChild = removeChild;
exports.countChildrenAndComments = countChildrenAndComments;
exports.merge = merge;
exports.updateAll = updateAll;
function withMainlineChild(node, f) {
    const next = node.children[0];
    return next ? f(next) : undefined;
}
function findInMainline(fromNode, predicate) {
    let curr = fromNode;
    while (curr) {
        if (predicate(curr))
            return curr;
        curr = curr.children[0];
    }
    return undefined;
}
// returns a list of nodes collected from the original one
function collect(from, pickChild) {
    const nodes = [from];
    let n = from;
    let c;
    while ((c = pickChild(n))) {
        nodes.push(c);
        n = c;
    }
    return nodes;
}
function childById(node, id) {
    const children = node.children;
    const len = children.length;
    for (let i = 0; i < len; i++) {
        if (children[i].id === id)
            return children[i];
    }
    return undefined;
}
const last = (nodeList) => nodeList[nodeList.length - 1];
exports.last = last;
function nodeAtPly(nodeList, ply) {
    const len = nodeList.length;
    for (let i = 0; i < len; i++) {
        if (nodeList[i].ply === ply)
            return nodeList[i];
    }
    return undefined;
}
function takePathWhile(nodeList, predicate) {
    const parts = [];
    const len = nodeList.length;
    for (let i = 0; i < len; i++) {
        const n = nodeList[i];
        if (predicate(n))
            parts.push(n.id);
        else
            break;
    }
    return parts.join('');
}
function removeChild(parent, id) {
    const children = parent.children;
    const len = children.length;
    for (let i = 0; i < len; i++) {
        if (children[i].id === id) {
            children.splice(i, 1);
            return;
        }
    }
}
function countChildrenAndComments(root) {
    const count = {
        nodes: 0,
        comments: 0,
    };
    function walk(node) {
        count.nodes++;
        if (node.comments)
            count.comments += node.comments.length;
        const children = node.children;
        const len = children.length;
        for (let i = 0; i < len; i++) {
            walk(children[i]);
        }
    }
    walk(root);
    return count;
}
// adds n2 into n1
function merge(n1, n2) {
    if (n2.eval)
        n1.eval = n2.eval;
    if (n2.glyphs)
        n1.glyphs = n2.glyphs;
    if (n2.comments) {
        if (!n1.comments) {
            n1.comments = n2.comments.slice();
        }
        else {
            for (let i = 0; i < n2.comments.length; i++) {
                const c = n2.comments[i];
                let found = false;
                for (let j = 0; j < n1.comments.length; j++) {
                    if (n1.comments[j].text === c.text) {
                        found = true;
                        break;
                    }
                }
                if (!found)
                    n1.comments.push(c);
            }
        }
    }
    if (n2.startingComments) {
        if (!n1.startingComments) {
            n1.startingComments = n2.startingComments.slice();
        }
        else {
            for (let i = 0; i < n2.startingComments.length; i++) {
                const c = n2.startingComments[i];
                let found = false;
                for (let j = 0; j < n1.startingComments.length; j++) {
                    if (n1.startingComments[j].text === c.text) {
                        found = true;
                        break;
                    }
                }
                if (!found)
                    n1.startingComments.push(c);
            }
        }
    }
    const n2Children = n2.children;
    const n2Len = n2Children.length;
    for (let i = 0; i < n2Len; i++) {
        const c = n2Children[i];
        const existing = childById(n1, c.id);
        if (existing)
            merge(existing, c);
        else
            n1.children.push(c);
    }
}
const hasBranching = (node, maxDepth) => maxDepth <= 0 || !!node.children[1] || (node.children[0] ? (0, exports.hasBranching)(node.children[0], maxDepth - 1) : false);
exports.hasBranching = hasBranching;
const mainlineNodeList = (from) => collect(from, node => node.children[0]);
exports.mainlineNodeList = mainlineNodeList;
function updateAll(root, f) {
    function update(node) {
        f(node);
        const children = node.children;
        const len = children.length;
        for (let i = 0; i < len; i++) {
            update(children[i]);
        }
    }
    update(root);
}
