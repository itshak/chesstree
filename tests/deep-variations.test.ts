import { describe, it, expect } from 'vitest';
import pgnImport from '../src/pgnImport';
import { renderFullTxt } from '../src/pgnExport';
import { build } from '../src/tree';

describe('Deep Variations and Export Optimizations', () => {
  const deepPgn = `[Event "Complex Variations"]
[Site "Tournament"]
[Date "2026.01.01"]
[Round "1"]
[White "Kasparov"]
[Black "Deep Blue"]
[Result "1-0"]

1. e4 c5 2. Nf3 d6 (2... e6 3. d4 cxd4 (3... Nf6 4. Nc3)) 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 (6... Ng4 7. Bg5 h6 8. Bh4 g5 9. Bg3 Bg7) 7. Nb3 Be6 8. f3 Be7 9. Qd2 O-O 10. O-O-O Nbd7 1-0`;

  it('correctly parses and preserves multi-level nested variations', () => {
    const data = pgnImport(deepPgn);
    const tree = build(data.treeParts[0]);

    expect(tree.pathIsMainline('')).toBe(true);

    const longestPath = tree.extendPath('', true);
    expect(tree.pathIsMainline(longestPath)).toBe(true);

    // Look up last mainline node
    const lastNode = tree.lastMainlineNode(longestPath);
    expect(lastNode.san).toBe('Nbd7');
  });

  it('exports and re-imports complex nested PGN cleanly', () => {
    const data = pgnImport(deepPgn);
    const tree = build(data.treeParts[0]);

    const exported = renderFullTxt({ data, tree });
    expect(exported).toContain('[Event "Complex Variations"]');
    expect(exported).toContain('1. e4 c5');
    expect(exported).toContain('(2... e6');
    expect(exported).toContain('(6... Ng4');
    expect(exported).toContain('1-0');

    // Roundtrip test
    const reimported = pgnImport(exported);
    expect(reimported.game.event).toBe('Complex Variations');
    expect(reimported.treeParts[0].children.length).toBe(1);
  });

  it('tests longestValidPath with complete and partial paths', () => {
    const data = pgnImport(deepPgn);
    const tree = build(data.treeParts[0]);

    const validPath = tree.extendPath('', true);
    expect(tree.longestValidPath(validPath)).toBe(validPath);

    // Path with invalid trailing segment
    const invalidPath = validPath + 'zz99';
    expect(tree.longestValidPath(invalidPath)).toBe(validPath);
  });
});
