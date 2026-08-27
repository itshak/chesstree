# `chesstree` Architecture & Technical Reference

> **License:** GNU General Public License v3.0 or later (GPL-3.0-or-later)  
> **Underlying Chess Engine:** `chessops` (GPL-3.0)  
> **Primary Use Case:** High-performance in-memory chess game and variation tree parser, manipulator, and serializer for desktop and web workstations.

---

## 1. Overview & Data Model

`chesstree` manages interactive chess trees with multi-level recursive annotation variations (RAVs), comments, NAGs, clock annotations (`[%clk ...]`), board shapes/arrows (`[%cal ...]`, `[%csl ...]`), and eval tags.

```
                           Root Node (Initial FEN)
                                    │
                         ┌──────────┴──────────┐
                         │ 1. e4 (id: "a8")    │
                         └──────────┬──────────┘
                                    │
                 ┌──────────────────┴──────────────────┐
                 │                                     │
       ┌─────────┴──────────┐                ┌─────────┴──────────┐
       │ 1... c5 (id: "b7") │                │ 1... e5 (id: "c6") │  (Variation)
       └─────────┬──────────┘                └────────────────────┘
                 │
       ┌─────────┴──────────┐
       │ 2. Nf3 (id: "d5")  │
       └────────────────────┘
```

### Core Interfaces

```typescript
export namespace Tree {
  export type Path = string; // Concatenation of 2-character move IDs, e.g. "a8b7d5"

  export interface Node {
    id: string;              // Unique 2-character move identifier within parent (scalachess char-pair)
    ply: number;             // Half-move ply count (1 = 1. White, 2 = 1... Black)
    san: string;             // Standard Algebraic Notation (e.g. "Nf3", "O-O")
    uci: string;             // Universal Chess Interface string (e.g. "g1f3", "e1g1")
    fen: string;             // Resulting FEN string after this move
    children: Node[];        // children[0] is the mainline continuation; children[1..N] are variations
    check?: Square;          // Square of checked king, if in check
    comments?: Comment[];    // Move annotations { id, text }
    startingComments?: Comment[];
    glyphs?: Glyph[];        // NAG annotations (e.g. !, ?, !?, !!)
    shapes?: Shape[];        // Colored arrows and circle highlights
    clock?: Clock;           // Remaining clock time at this ply
    dests?: string;          // Legal destination squares for board interaction
    drops?: string;          // Variant piece drop squares (e.g. Crazyhouse)
    forceVariation?: boolean;// Displayed as a variation even if it's the first child
  }
}
```

---

## 2. Path Representation & Indexing

Paths in `chesstree` represent navigation routes through the tree from root to any node:
- The root path is the empty string `''`.
- Each move step adds a 2-character ID (derived from `scalachessCharPair` via `chessops`).
- Example path: `"a8b7d5"` represents:
  1. `root` $\to$ Child `"a8"` (1. e4)
  2. $\to$ Child `"b7"` (1... c5)
  3. $\to$ Child `"d5"` (2. Nf3)

---

## 3. High-Performance Optimizations

`chesstree` has been tuned for zero garbage collection pause, sub-millisecond keyboard navigation, and fast large PGN parsing:

### A. Zero-Allocation Iterative Path Lookups
- **Legacy:** Recursive slicing (`path.slice(0, 2)` + `path.slice(2)`) allocated dozens of temporary string objects per move lookup.
- **Optimized:** Iterative traversal using pointer arithmetic (`i += 2`) and character code matching (`path.charCodeAt(i)`).
- **Result:** $100\%$ elimination of string substring allocations during tree navigation.

### B. 64-Entry MRU Path Cache (`pathCache`)
- `TreeWrapper` maintains a lightweight `Map<Tree.Path, Tree.Node>` MRU cache.
- During rapid keyboard stepping (`[` and `]`) or multi-widget React renders (Board, Movetext, Engine, Announcer), queries to the active path return in **$O(1)$ directly from cache**.
- The cache is automatically invalidated on all tree mutations (`addNode`, `deleteNodeAt`, `promoteAt`, `updateAt`, `merge`).

### C. Direct Loops vs Higher-Order Array Closures
- Hot path utilities in `ops.ts` (`childById`, `nodeAtPly`, `removeChild`, `updateAll`) use direct `for (let i = 0; i < len; i++)` loops instead of `.find()` / `.filter()` / `.forEach()`.
- Eliminates closures in the V8 hot path, reducing GC pressure during fast tree updates.

### D. Single-Pass Accumulator for Tree Statistics
- `countChildrenAndComments` uses a single accumulator object `{ nodes: 0, comments: 0 }` walked across the tree, avoiding recursive object allocations at every node.

### E. Optimized PGN Exporter with Map Deduplication
- `pgnExport.ts` uses a `Map<string, string>` for tag deduplication instead of linear $O(N^2)$ array scans.
- Text rendering uses chunked string arrays (`join(' ')`) to avoid memory copying during large recursive variation exports.

---

## 4. API Reference

### `pgnImport(pgn: string): AnalyseData`
Parses a PGN string into structured game headers and a root `Tree.Node`.
```typescript
import { pgnImport, tree } from 'chesstree';

const data = pgnImport(pgnString);
const gameTree = tree.build(data.treeParts[0]);
```

### `tree.build(root: Tree.Node): TreeWrapper`
Wraps the root node with high-level navigation, mutation, and query methods:
- `nodeAtPath(path: string): Tree.Node | undefined` — Fast cached node lookup.
- `getNodeList(path: string): Tree.Node[]` — Ordered array of nodes from root to target path.
- `promoteAt(path: string, toMainline: boolean): void` — Promotes a variation to mainline or parent variation.
- `deleteNodeAt(path: string): void` — Deletes a node and all its subvariations in-place.
- `addNode(node: Tree.Node, path: string): string | undefined` — Appends or merges a move into the tree.
- `setCommentAt(comment: Tree.Comment, path: string): void` — Adds or updates annotations.
- `extendPath(path: string, isMainline: boolean): string` — Extends a path to the end of the line.
- `pathIsMainline(path: string): boolean` — Checks if a path is on the absolute mainline.

### `pgnExport.renderFullTxt({ data, tree }): string`
Serializes the entire game tree (with headers, variations, NAGs, and comments) back into standard PGN text.

---

## 5. Development & Testing

```bash
# Install dependencies
npm install

# Run unit test suite
npm test

# Build TypeScript to dist/
npm run build
```
