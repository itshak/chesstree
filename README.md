# pgn-chess-tree

[![npm version](https://img.shields.io/npm/v/pgn-chess-tree.svg)](https://www.npmjs.com/package/pgn-chess-tree)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)]()

`pgn-chess-tree` is a high-performance JavaScript and TypeScript library for parsing, manipulating, and serializing PGN (Portable Game Notation) chess games and complex variation trees.

Originally adapted from the battle-tested analysis tree logic of [Lichess.org](https://lichess.org) and powered by [`chessops`](https://github.com/niklasf/chessops), this standalone library is fine-tuned for desktop workstations (such as [BlindBase](https://github.com/itshak/blindbase)), web apps, and chess study tools requiring sub-millisecond keyboard navigation, deep variation editing, and zero garbage-collector stutter.

---

## Highlights & Features

- 🌳 **Complete Variation Tree Support:** Parse and manipulate unlimited levels of nested variations (RAVs), move comments, starting comments, NAG glyphs (`!`, `?`, `!?`), clock annotations (`[%clk ...]`), and board drawings (`[%cal ...]`, `[%csl ...]`).
- ⚡ **Zero-Allocation Path Algebra:** Iterative move lookups and path calculations eliminate substring memory allocations and recursive call frames in hot render loops.
- 🚀 **64-Entry MRU Path Cache:** Active move paths return in $O(1)$ directly from memory, keeping 120fps UI navigation silky smooth.
- 🔁 **Lossless Roundtrip Export:** Serialize modified variation trees back to standard PGN with proper indentation, comment escaping, and tag preservation.
- 🛡️ **Type-Safe:** 100% strict TypeScript definitions with full autocomplete and type inference.
- 🌐 **Framework Agnostic:** Works seamlessly in Node.js, React, Vue, Svelte, Electron, Tauri, or vanilla browser JavaScript.

---

## Installation

```bash
npm install pgn-chess-tree
```

Or with yarn / pnpm:

```bash
yarn add pgn-chess-tree
# or
pnpm add pgn-chess-tree
```

---

## Quick Start

### 1. Parse a PGN Game

```typescript
import { pgnImport, buildTree, pgnExport } from 'pgn-chess-tree';

const pgn = `[Event "World Championship"]
[Site "Reykjavik ISL"]
[Date "1972.07.23"]
[Round "6"]
[White "Fischer, Robert J."]
[Black "Spassky, Boris V."]
[Result "1-0"]

1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6 7. Bh4 b6 1-0`;

const parsed = pgnImport(pgn);
const tree = buildTree(parsed.treeParts[0]);

console.log(`White: ${parsed.game.white?.name}`);
console.log(`Black: ${parsed.game.black?.name}`);
console.log(`Mainline moves: ${tree.lastPly()} plies`);
```

---

### 2. Navigating and Manipulating the Tree

Move paths are encoded as compact 2-character ID sequences representing each step from the root:

```typescript
// Find the first move (1. c4)
const firstMove = tree.root.children[0];
const path1 = firstMove.id;

// Find the second move (1... e6)
const secondMove = firstMove.children[0];
const path2 = path1 + secondMove.id;

// Query a node at a specific path
const node = tree.nodeAtPath(path2);
console.log(node?.san); // "e6"
console.log(node?.fen); // Current board FEN

// Add or edit annotations
tree.setCommentAt({ id: 'c1', text: 'Classic Tartakower defense setup.' }, path2);

// Add a sideline variation (e.g. 1... c5 after 1. c4)
const sidelineNode: Tree.Node = {
  id: 'c7c5',
  ply: 2,
  san: 'c5',
  fen: 'rnbqkbnr/pp1ppppp/8/2p5/2P5/8/PP1PPPPP/RNBQKBNR w KQkq c6 0 2',
  uci: 'c7c5',
  children: [],
};
const sidelinePath = tree.addNode(sidelineNode, path1);

// Promote variation to mainline
if (sidelinePath) {
  tree.promoteAt(sidelinePath, true);
}
```

---

### 3. Exporting Back to PGN

```typescript
const exportedPgn = pgnExport.renderFullTxt({
  data: parsed,
  tree,
});

console.log(exportedPgn);
```

---

## API Reference

### `pgnImport(pgn: string): AnalyseData`
Parses a PGN string into structured game headers and a root node array (`treeParts`).

### `buildTree(root: Tree.Node): TreeWrapper` / `tree.build(root)`
Creates an optimized navigation wrapper over the tree with the following methods:

| Method | Return Type | Description |
|---|---|---|
| `nodeAtPath(path: string)` | `Tree.Node \| undefined` | Cached, $O(1)$ / $O(N)$ node lookup. |
| `getNodeList(path: string)` | `Tree.Node[]` | Ordered array of nodes from root to target path. |
| `longestValidPath(path: string)` | `string` | Returns the longest prefix of `path` that exists in the tree. |
| `pathIsMainline(path: string)` | `boolean` | Returns `true` if the path lies on the primary mainline. |
| `lastMainlineNode(path: string)` | `Tree.Node` | Finds the last mainline node along a path. |
| `extendPath(path: string, isMainline: boolean)` | `string` | Extends a path to the terminus of the line. |
| `addNode(node: Tree.Node, parentPath: string)` | `string \| undefined` | Inserts or merges a move at the specified parent path. |
| `promoteAt(path: string, toMainline: boolean)` | `void` | Promotes a variation to mainline or parent rank. |
| `deleteNodeAt(path: string)` | `void` | Removes a node and all descendant branches in-place. |
| `setCommentAt(comment: Tree.Comment, path: string)` | `void` | Adds or updates move comments. |
| `deleteCommentAt(id: string, path: string)` | `void` | Removes a comment by ID. |
| `setGlyphsAt(glyphs: Tree.Glyph[], path: string)` | `void` | Assigns NAG annotation glyphs. |
| `setShapes(shapes: Tree.Shape[], path: string)` | `void` | Assigns board arrows and highlights. |

---

## Performance & Architecture

For deep-dive details on the underlying data structures, zero-allocation algorithms, and benchmark comparisons, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Contributing

We welcome community contributions, bug reports, and optimizations!

1. Fork the repository on GitHub: [`https://github.com/itshak/pgn-chess-tree`](https://github.com/itshak/pgn-chess-tree)
2. Clone your fork and install dependencies:
   ```bash
   git clone https://github.com/your-username/pgn-chess-tree.git
   cd pgn-chess-tree
   npm install
   ```
3. Run the test suite:
   ```bash
   npm test
   ```
4. Make your changes in `src/`, verify with `npm run build` and `npm test`, and open a Pull Request.

Please see [`CONTRIBUTING.md`](CONTRIBUTING.md) for full development guidelines.

---

## License & Attribution

- **License:** GNU Affero General Public License v3.0 or later ([AGPL-3.0-or-later](LICENSE)).
- **Attribution:** Adapted from [Lichess.org](https://lichess.org) (GPL-3.0) and uses [`chessops`](https://github.com/niklasf/chessops) by Niklas Fiekas (GPL-3.0).
