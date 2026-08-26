import { describe, it, expect } from 'vitest';
import pgnImport from '../src/pgnImport';
import { build } from '../src/tree';
import * as path from '../src/path';
import * as ops from '../src/ops';

describe('Performance, Path, and Cache Operations', () => {
  const pgn = `[Event "Cache Test"]
[Site "BlindBase"]
[Date "2026.08.26"]
[White "Player 1"]
[Black "Player 2"]
[Result "1-0"]

1. e4 e5 (1... c5 2. Nf3 d6 (2... Nc6 3. Bb5)) 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O 1-0`;

  it('correctly builds tree and tests fast iterative path lookups', () => {
    const data = pgnImport(pgn);
    const tree = build(data.treeParts[0]);

    // Root lookup
    expect(tree.nodeAtPath('')).toBe(tree.root);

    // Mainline lookup
    const mainline = tree.getNodeList(tree.extendPath('', true));
    expect(mainline.length).toBeGreaterThan(5);

    const fullPath = path.fromNodeList(mainline);
    const node = tree.nodeAtPath(fullPath);
    expect(node).toBeDefined();
    expect(node?.san).toBe('O-O');

    // Test cached lookup returns identical node
    const cachedNode = tree.nodeAtPath(fullPath);
    expect(cachedNode).toBe(node);
  });

  it('invalidates MRU path cache on mutations', () => {
    const data = pgnImport(pgn);
    const tree = build(data.treeParts[0]);

    const e4Child = tree.root.children[0];
    const e4Path = e4Child.id;

    // Prime cache
    const node1 = tree.nodeAtPath(e4Path);
    expect(node1).toBe(e4Child);

    // Mutate comment
    tree.setCommentAt({ id: 'c1', text: 'Great move!' }, e4Path);

    // Node is updated and cache reflects it
    const node2 = tree.nodeAtPath(e4Path);
    expect(node2?.comments?.length).toBe(1);
    expect(node2?.comments?.[0].text).toBe('Great move!');

    // Delete comment
    tree.deleteCommentAt('c1', e4Path);
    const node3 = tree.nodeAtPath(e4Path);
    expect(node3?.comments).toBeUndefined();
  });

  it('tests path utility functions with zero recursion', () => {
    const p1 = 'a8b7c6d5';
    const p2 = 'a8b7e4';
    const p3 = 'a8b7c6';

    expect(path.intersection(p1, p2)).toBe('a8b7');
    expect(path.intersection(p1, p3)).toBe('a8b7c6');
    expect(path.intersection(p1, '')).toBe('');
    expect(path.intersection('', p2)).toBe('');

    expect(path.isChildOf('a8b7', 'a8')).toBe(true);
    expect(path.isChildOf('a8b7c6', 'a8')).toBe(false);
    expect(path.isChildOf('a8', '')).toBe(true);

    expect(path.size('a8b7c6')).toBe(3);
    expect(path.head('a8b7c6')).toBe('a8');
    expect(path.tail('a8b7c6')).toBe('b7c6');
    expect(path.init('a8b7c6')).toBe('a8b7');
    expect(path.last('a8b7c6')).toBe('c6');
  });

  it('counts children and comments without allocating per-node objects', () => {
    const data = pgnImport(pgn);
    const counts = ops.countChildrenAndComments(data.treeParts[0]);
    expect(counts.nodes).toBeGreaterThan(8);
    expect(typeof counts.comments).toBe('number');
  });

  it('handles in-place child removal cleanly', () => {
    const data = pgnImport(pgn);
    const root = data.treeParts[0];
    const initialChildrenCount = root.children.length;
    expect(initialChildrenCount).toBe(1);

    const childId = root.children[0].id;
    ops.removeChild(root, childId);
    expect(root.children.length).toBe(0);
  });
});
