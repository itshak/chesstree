export const root: Tree.Path = '';

export const size = (path: Tree.Path): number => path.length / 2;

export const head = (path: Tree.Path): Tree.Path => path.slice(0, 2);

export const tail = (path: Tree.Path): string => path.slice(2);

export const init = (path: Tree.Path): Tree.Path => path.slice(0, -2);

export const last = (path: Tree.Path): string => path.slice(-2);

export const contains = (p1: Tree.Path, p2: Tree.Path): boolean => p1.startsWith(p2);

export const fromNodeList = (nodes: Tree.Node[]): Tree.Path => {
  const len = nodes.length;
  if (len === 0) return '';
  if (len === 1) return nodes[0].id;
  const parts: string[] = new Array(len);
  for (let i = 0; i < len; i++) {
    parts[i] = nodes[i].id;
  }
  return parts.join('');
};

export const isChildOf = (child: Tree.Path, parent: Tree.Path): boolean =>
  !!child && child.length === parent.length + 2 && child.startsWith(parent);

export const intersection = (p1: Tree.Path, p2: Tree.Path): Tree.Path => {
  const minLen = Math.min(p1.length, p2.length);
  let commonLen = 0;
  for (let i = 0; i < minLen; i += 2) {
    if (p1.charCodeAt(i) === p2.charCodeAt(i) && p1.charCodeAt(i + 1) === p2.charCodeAt(i + 1)) {
      commonLen += 2;
    } else {
      break;
    }
  }
  return commonLen > 0 ? p1.slice(0, commonLen) : '';
};
