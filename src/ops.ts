export function withMainlineChild<T>(node: Tree.Node, f: (node: Tree.Node) => T): T | undefined {
  const next = node.children[0];
  return next ? f(next) : undefined;
}

export function findInMainline(
  fromNode: Tree.Node,
  predicate: (node: Tree.Node) => boolean,
): Tree.Node | undefined {
  let curr: Tree.Node | undefined = fromNode;
  while (curr) {
    if (predicate(curr)) return curr;
    curr = curr.children[0];
  }
  return undefined;
}

// returns a list of nodes collected from the original one
export function collect(from: Tree.Node, pickChild: (node: Tree.Node) => Tree.Node | undefined): Tree.Node[] {
  const nodes = [from];
  let n = from;
  let c: Tree.Node | undefined;
  while ((c = pickChild(n))) {
    nodes.push(c);
    n = c;
  }
  return nodes;
}

export function childById(node: Tree.Node, id: string): Tree.Node | undefined {
  const children = node.children;
  const len = children.length;
  for (let i = 0; i < len; i++) {
    if (children[i].id === id) return children[i];
  }
  return undefined;
}

export const last = (nodeList: Tree.Node[]): Tree.Node | undefined => nodeList[nodeList.length - 1];

export function nodeAtPly(nodeList: Tree.Node[], ply: number): Tree.Node | undefined {
  const len = nodeList.length;
  for (let i = 0; i < len; i++) {
    if (nodeList[i].ply === ply) return nodeList[i];
  }
  return undefined;
}

export function takePathWhile(nodeList: Tree.Node[], predicate: (node: Tree.Node) => boolean): Tree.Path {
  const parts: string[] = [];
  const len = nodeList.length;
  for (let i = 0; i < len; i++) {
    const n = nodeList[i];
    if (predicate(n)) parts.push(n.id);
    else break;
  }
  return parts.join('');
}

export function removeChild(parent: Tree.Node, id: string): void {
  const children = parent.children;
  const len = children.length;
  for (let i = 0; i < len; i++) {
    if (children[i].id === id) {
      children.splice(i, 1);
      return;
    }
  }
}

export function countChildrenAndComments(root: Tree.Node): {
  nodes: number;
  comments: number;
} {
  const count = {
    nodes: 0,
    comments: 0,
  };
  function walk(node: Tree.Node) {
    count.nodes++;
    if (node.comments) count.comments += node.comments.length;
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
export function merge(n1: Tree.Node, n2: Tree.Node): void {
  if (n2.eval) n1.eval = n2.eval;
  if (n2.glyphs) n1.glyphs = n2.glyphs;
  if (n2.comments) {
    if (!n1.comments) {
      n1.comments = n2.comments.slice();
    } else {
      for (let i = 0; i < n2.comments.length; i++) {
        const c = n2.comments[i];
        let found = false;
        for (let j = 0; j < n1.comments.length; j++) {
          if (n1.comments[j].text === c.text) {
            found = true;
            break;
          }
        }
        if (!found) n1.comments.push(c);
      }
    }
  }
  if (n2.startingComments) {
    if (!n1.startingComments) {
      n1.startingComments = n2.startingComments.slice();
    } else {
      for (let i = 0; i < n2.startingComments.length; i++) {
        const c = n2.startingComments[i];
        let found = false;
        for (let j = 0; j < n1.startingComments.length; j++) {
          if (n1.startingComments[j].text === c.text) {
            found = true;
            break;
          }
        }
        if (!found) n1.startingComments.push(c);
      }
    }
  }
  const n2Children = n2.children;
  const n2Len = n2Children.length;
  for (let i = 0; i < n2Len; i++) {
    const c = n2Children[i];
    const existing = childById(n1, c.id);
    if (existing) merge(existing, c);
    else n1.children.push(c);
  }
}

export const hasBranching = (node: Tree.Node, maxDepth: number): boolean =>
  maxDepth <= 0 || !!node.children[1] || (node.children[0] ? hasBranching(node.children[0], maxDepth - 1) : false);

export const mainlineNodeList = (from: Tree.Node): Tree.Node[] => collect(from, node => node.children[0]);

export function updateAll(root: Tree.Node, f: (node: Tree.Node) => void): void {
  function update(node: Tree.Node) {
    f(node);
    const children = node.children;
    const len = children.length;
    for (let i = 0; i < len; i++) {
      update(children[i]);
    }
  }
  update(root);
}
