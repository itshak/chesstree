import * as treePath from './path';
import * as ops from './ops';
import { defined } from './common';

export { treePath as path, ops };

export type MaybeNode = Tree.Node | undefined;

export interface TreeWrapper {
  root: Tree.Node;
  lastPly(): number;
  nodeAtPath(path: Tree.Path): Tree.Node | undefined;
  getNodeList(path: Tree.Path): Tree.Node[];
  longestValidPath(path: string): Tree.Path;
  updateAt(path: Tree.Path, update: (node: Tree.Node) => void): MaybeNode;
  addNode(node: Tree.Node, path: Tree.Path): Tree.Path | undefined;
  addNodes(nodes: Tree.Node[], path: Tree.Path): Tree.Path | undefined;
  addDests(dests: string, path: Tree.Path): MaybeNode;
  setShapes(shapes: Tree.Shape[], path: Tree.Path): MaybeNode;
  setCommentAt(comment: Tree.Comment, path: Tree.Path): MaybeNode;
  deleteCommentAt(id: string, path: Tree.Path): MaybeNode;
  setGlyphsAt(glyphs: Tree.Glyph[], path: Tree.Path): MaybeNode;
  setClockAt(clock: Tree.Clock | undefined, path: Tree.Path): MaybeNode;
  pathIsMainline(path: Tree.Path): boolean;
  pathIsForcedVariation(path: Tree.Path): boolean;
  lastMainlineNode(path: Tree.Path): Tree.Node;
  extendPath(path: Tree.Path, isMainline: boolean): Tree.Path;
  pathExists(path: Tree.Path): boolean;
  deleteNodeAt(path: Tree.Path): void;
  promoteAt(path: Tree.Path, toMainline: boolean): void;
  forceVariationAt(path: Tree.Path, force: boolean): MaybeNode;
  getCurrentNodesAfterPly(nodeList: Tree.Node[], mainline: Tree.Node[], ply: number): Tree.Node[];
  merge(tree: Tree.Node): void;
  removeCeval(): void;
  parentNode(path: Tree.Path): Tree.Node | undefined;
  getParentClock(node: Tree.Node, path: Tree.Path): Tree.Clock | undefined;
  walkUntilTrue(
    fn: (node: Tree.Node, isMainline: boolean) => boolean,
    path?: Tree.Path,
    branchOnly?: boolean,
  ): boolean;
}

export function build(root: Tree.Node): TreeWrapper {
  const pathCache = new Map<Tree.Path, Tree.Node>();
  const MAX_CACHE_SIZE = 64;

  const invalidateCache = () => {
    pathCache.clear();
  };

  const lastNode = (): MaybeNode => ops.findInMainline(root, (node: Tree.Node) => !node.children.length);

  function nodeAtPathDirect(rootNode: Tree.Node, path: Tree.Path): Tree.Node | undefined {
    if (path === '') return rootNode;
    const len = path.length;
    if (len % 2 !== 0) return undefined;
    let curr: Tree.Node | undefined = rootNode;
    for (let i = 0; i < len; i += 2) {
      if (!curr) return undefined;
      const c0 = path.charCodeAt(i);
      const c1 = path.charCodeAt(i + 1);
      const children: Tree.Node[] = curr.children;
      const cLen = children.length;
      let match: Tree.Node | undefined = undefined;
      for (let j = 0; j < cLen; j++) {
        const child: Tree.Node = children[j];
        if (child.id.charCodeAt(0) === c0 && child.id.charCodeAt(1) === c1) {
          match = child;
          break;
        }
      }
      curr = match;
    }
    return curr;
  }

  const nodeAtPathOrNull = (path: Tree.Path): Tree.Node | undefined => {
    if (path === '') return root;
    const cached = pathCache.get(path);
    if (cached) return cached;
    const node = nodeAtPathDirect(root, path);
    if (node) {
      if (pathCache.size >= MAX_CACHE_SIZE) {
        pathCache.clear();
      }
      pathCache.set(path, node);
    }
    return node;
  };

  function longestValidPathFrom(rootNode: Tree.Node, path: Tree.Path): Tree.Path {
    if (!path) return '';
    const len = path.length;
    let curr: Tree.Node | undefined = rootNode;
    let validLen = 0;
    for (let i = 0; i < len; i += 2) {
      if (!curr) break;
      const c0 = path.charCodeAt(i);
      const c1 = path.charCodeAt(i + 1);
      const children: Tree.Node[] = curr.children;
      const cLen = children.length;
      let match: Tree.Node | undefined = undefined;
      for (let j = 0; j < cLen; j++) {
        const child: Tree.Node = children[j];
        if (child.id.charCodeAt(0) === c0 && child.id.charCodeAt(1) === c1) {
          match = child;
          break;
        }
      }
      if (match) {
        validLen += 2;
        curr = match;
      } else {
        break;
      }
    }
    return validLen > 0 ? path.slice(0, validLen) : '';
  }

  function getCurrentNodesAfterPly(nodeList: Tree.Node[], mainline: Tree.Node[], ply: number): Tree.Node[] {
    const nodes: Tree.Node[] = [];
    const len = nodeList.length;
    for (let i = 0; i < len; i++) {
      const node = nodeList[i];
      if (node.ply <= ply && mainline[i]?.id !== node.id) break;
      if (node.ply > ply) nodes.push(node);
    }
    return nodes;
  }

  function pathIsMainline(path: Tree.Path): boolean {
    if (path === '') return true;
    const len = path.length;
    let curr: Tree.Node | undefined = root;
    for (let i = 0; i < len; i += 2) {
      if (!curr) return false;
      const firstChild: Tree.Node | undefined = curr.children[0];
      if (!firstChild) return false;
      if (
        firstChild.id.charCodeAt(0) !== path.charCodeAt(i) ||
        firstChild.id.charCodeAt(1) !== path.charCodeAt(i + 1)
      ) {
        return false;
      }
      curr = firstChild;
    }
    return true;
  }

  const pathExists = (path: Tree.Path): boolean => !!nodeAtPathOrNull(path);

  const pathIsForcedVariation = (path: Tree.Path): boolean => {
    const list = getNodeList(path);
    const len = list.length;
    for (let i = 0; i < len; i++) {
      if (list[i].forceVariation) return true;
    }
    return false;
  };

  function lastMainlineNodeFrom(rootNode: Tree.Node, path: Tree.Path): Tree.Node {
    if (path === '') return rootNode;
    const len = path.length;
    let curr: Tree.Node = rootNode;
    for (let i = 0; i < len; i += 2) {
      const firstChild: Tree.Node | undefined = curr.children[0];
      if (!firstChild) return curr;
      if (
        firstChild.id.charCodeAt(0) !== path.charCodeAt(i) ||
        firstChild.id.charCodeAt(1) !== path.charCodeAt(i + 1)
      ) {
        return curr;
      }
      curr = firstChild;
    }
    return curr;
  }

  const getNodeList = (path: Tree.Path): Tree.Node[] => {
    const nodes: Tree.Node[] = [root];
    if (path === '') return nodes;
    const len = path.length;
    let curr: Tree.Node | undefined = root;
    for (let i = 0; i < len; i += 2) {
      if (!curr) break;
      const c0 = path.charCodeAt(i);
      const c1 = path.charCodeAt(i + 1);
      const children: Tree.Node[] = curr.children;
      const cLen = children.length;
      let match: Tree.Node | undefined = undefined;
      for (let j = 0; j < cLen; j++) {
        const child: Tree.Node = children[j];
        if (child.id.charCodeAt(0) === c0 && child.id.charCodeAt(1) === c1) {
          match = child;
          break;
        }
      }
      if (match) {
        nodes.push(match);
        curr = match;
      } else {
        break;
      }
    }
    return nodes;
  };

  const extendPath = (path: Tree.Path, isMainline: boolean): Tree.Path => {
    let currNode = nodeAtPathOrNull(path);
    let extended = path;
    while ((currNode = currNode?.children[0]) && !(isMainline && currNode.forceVariation)) {
      extended += currNode.id;
    }
    return extended;
  };

  function updateAt(path: Tree.Path, update: (node: Tree.Node) => void): Tree.Node | undefined {
    const node = nodeAtPathOrNull(path);
    if (node) {
      update(node);
      invalidateCache();
    }
    return node;
  }

  // returns new path
  function addNode(node: Tree.Node, path: Tree.Path): Tree.Path | undefined {
    const newPath = path + node.id;
    const existing = nodeAtPathOrNull(newPath);
    if (existing) {
      const keys: Array<keyof Tree.Node> = ['dests', 'drops', 'clock'];
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (defined(node[key]) && !defined(existing[key])) {
          existing[key] = node[key] as never;
        }
      }
      return newPath;
    }
    const res = updateAt(path, function (parent: Tree.Node) {
      if (parent.children[0]?.forceVariation) {
        parent.children[0].forceVariation = false;
        parent.children.unshift(node);
      } else parent.children.push(node);
    });
    if (res) {
      invalidateCache();
      return newPath;
    }
    return undefined;
  }

  function addNodes(nodes: Tree.Node[], path: Tree.Path): Tree.Path | undefined {
    const node = nodes[0];
    if (!node) return path;
    const newPath = addNode(node, path);
    return newPath ? addNodes(nodes.slice(1), newPath) : undefined;
  }

  const deleteNodeAt = (path: Tree.Path): void => {
    const parent = parentNode(path);
    if (parent) {
      ops.removeChild(parent, treePath.last(path));
      invalidateCache();
    }
  };

  function promoteAt(path: Tree.Path, toMainline: boolean): void {
    const nodes = getNodeList(path);
    let changed = false;
    for (let i = nodes.length - 2; i >= 0; i--) {
      const node = nodes[i + 1];
      const parent = nodes[i];
      if (parent.children[0]?.id !== node.id) {
        ops.removeChild(parent, node.id);
        parent.children.unshift(node);
        changed = true;
        if (!toMainline) break;
      } else if (node.forceVariation) {
        node.forceVariation = false;
        changed = true;
        if (!toMainline) break;
      }
    }
    if (changed) invalidateCache();
  }

  const setCommentAt = (comment: Tree.Comment, path: Tree.Path) =>
    !comment.text
      ? deleteCommentAt(comment.id, path)
      : updateAt(path, node => {
          node.comments = node.comments || [];
          const existing = node.comments.find(function (c) {
            return c.id === comment.id;
          });
          if (existing) existing.text = comment.text;
          else node.comments.push(comment);
        });

  const deleteCommentAt = (id: string, path: Tree.Path) =>
    updateAt(path, node => {
      const comments = (node.comments || []).filter(c => c.id !== id);
      node.comments = comments.length ? comments : undefined;
    });

  const setGlyphsAt = (glyphs: Tree.Glyph[], path: Tree.Path) =>
    updateAt(path, node => {
      node.glyphs = glyphs;
    });

  const parentNode = (path: Tree.Path): Tree.Node | undefined => nodeAtPathOrNull(treePath.init(path));

  const getParentClock = (node: Tree.Node, path: Tree.Path): Tree.Clock | undefined => {
    const parent = parentNode(path);
    return parent ? parent.clock : node.clock;
  };

  function walkUntilTrue(
    fn: (node: Tree.Node, isMainline: boolean) => boolean,
    from: Tree.Path = '',
    branchOnly: boolean = false,
  ) {
    function traverse(node: Tree.Node, isMainline: boolean): boolean {
      if (fn(node, isMainline)) return true;
      let i = branchOnly ? 1 : 0;
      branchOnly = false;
      while (i < node.children.length) {
        const c = node.children[i];
        if (traverse(c, isMainline && i === 0 && !c.forceVariation)) return true;
        i++;
      }
      return false;
    }
    const n = nodeAtPathOrNull(from);
    return n ? traverse(n, pathIsMainline(from)) : false;
  }

  return {
    root,
    lastPly: (): number => lastNode()?.ply || root.ply,
    nodeAtPath: nodeAtPathOrNull,
    getNodeList,
    longestValidPath: (path: string) => longestValidPathFrom(root, path),
    updateAt,
    addNode,
    addNodes,
    addDests: (dests: string, path: Tree.Path) =>
      updateAt(path, (node: Tree.Node) => {
        node.dests = dests;
      }),
    setShapes: (shapes: Tree.Shape[], path: Tree.Path) =>
      updateAt(path, (node: Tree.Node) => {
        node.shapes = shapes.slice();
      }),
    setCommentAt,
    deleteCommentAt,
    setGlyphsAt,
    setClockAt: (clock: Tree.Clock | undefined, path: Tree.Path) =>
      updateAt(path, node => {
        node.clock = clock;
      }),
    pathIsMainline,
    pathIsForcedVariation,
    lastMainlineNode: (path: Tree.Path): Tree.Node => lastMainlineNodeFrom(root, path),
    extendPath,
    pathExists,
    deleteNodeAt,
    promoteAt,
    forceVariationAt: (path: Tree.Path, force: boolean) =>
      updateAt(path, node => {
        node.forceVariation = force;
      }),
    getCurrentNodesAfterPly,
    merge: (tree: Tree.Node) => {
      ops.merge(root, tree);
      invalidateCache();
    },
    removeCeval: () =>
      ops.updateAll(root, function (n) {
      }),
    parentNode,
    getParentClock,
    walkUntilTrue,
  } as TreeWrapper;
}
