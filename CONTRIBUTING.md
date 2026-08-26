# Contributing to `pgn-chess-tree`

Thank you for your interest in improving `pgn-chess-tree`! We welcome bug fixes, performance enhancements, and new features that keep the library fast, accessible, and robust.

---

## Development Workflow

### 1. Requirements
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/itshak/pgn-chess-tree.git
cd pgn-chess-tree

# Install dependencies
npm install
```

### 3. Running Tests
We use [Vitest](https://vitest.dev/) for fast unit testing.
```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### 4. Building the Project
We use TypeScript (`tsc`) to compile `src/` to `dist/`.
```bash
npm run build
```

---

## Core Guidelines

1. **Performance First:**
   - Avoid unnecessary object and substring allocations in hot tree traversal functions (`src/tree.ts`, `src/ops.ts`, `src/path.ts`).
   - Prefer direct indexed `for` loops over functional array closures in performance-critical paths.
   - Any new mutating methods on `TreeWrapper` MUST invalidate the path cache (`invalidateCache()`).

2. **Strict TypeScript:**
   - All code in `src/` must pass `tsc` with zero errors.
   - Avoid `any` where specific types can be inferred or provided.

3. **Test Coverage:**
   - Every bug fix or new feature must be accompanied by new or updated unit tests in `tests/`.

4. **Licensing:**
   - All contributions are licensed under the **GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)**.
