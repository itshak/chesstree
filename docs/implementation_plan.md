# Rebrand pgn-chess-tree → chesstree

Rebrand the library from `pgn-chess-tree` to `chesstree`, switch license from AGPL-3.0 to GPL-3.0, overhaul the README to highlight Lichess heritage and performance advantages, create a promotion strategy doc, and incorporate quality improvements.

## Decisions

- **Version**: `2.0.0` — clean break signaling the rebrand
- **GitHub repo**: Already renamed to `itshak/chesstree` — all URLs will point there
- **BlindBase**: Drop all BlindBase references for now; may re-add later

## User Review Required

> [!IMPORTANT]
> **NPM publishing**: After all changes are made, you will need to manually run `npm publish` for the new `chesstree` package and `npm deprecate pgn-chess-tree "This package has been renamed to chesstree. Please install chesstree instead."` for the old one. These commands require npm authentication and will not be run automatically.

> [!IMPORTANT]
> **Logo**: The generated logo is a raster JPG. For production use (npm badge, GitHub, favicon), you may want to commission a vector SVG version later. For now, we'll use the generated image.

---

## Proposed Changes

### Component 1: Rebrand to `chesstree`

#### [MODIFY] [package.json](file:///Users/ais/Projects/pgn-chess-tree/package.json)
- Change `"name"` from `"pgn-chess-tree"` to `"chesstree"`
- Change `"version"` to `"2.0.0"`
- Update `"description"` to new tagline
- Update `"repository.url"` to `"git+https://github.com/itshak/chesstree.git"`
- Update `"bugs.url"` to `"https://github.com/itshak/chesstree/issues"`
- Update `"homepage"` to `"https://github.com/itshak/chesstree#readme"`
- Remove `"blindbase"` from keywords
- Expand keywords with SEO-optimized terms (see Component 5)

#### [MODIFY] [CONTRIBUTING.md](file:///Users/ais/Projects/pgn-chess-tree/CONTRIBUTING.md)
- Replace all `pgn-chess-tree` references with `chesstree`
- Update clone URL to `https://github.com/itshak/chesstree.git`
- Update license reference from AGPL to GPL-3.0

#### [MODIFY] [SECURITY.md](file:///Users/ais/Projects/pgn-chess-tree/SECURITY.md)
- Replace package name references with `chesstree`

#### [NEW] [assets/svg/logo.svg](file:///Users/ais/Projects/pgn-chess-tree/assets/svg/logo.svg)
- Clean vector SVG logo (13 KB) with dark green (`#0F5724`) chess tree

---

### Component 2: License Switch (AGPL-3.0 → GPL-3.0)

#### [MODIFY] [LICENSE](file:///Users/ais/Projects/pgn-chess-tree/LICENSE)
- Replace the full AGPL-3.0 text with GPL-3.0 text (standard FSF GPL-3.0 license body)

#### [MODIFY] [package.json](file:///Users/ais/Projects/pgn-chess-tree/package.json)
- Change `"license"` from `"AGPL-3.0-or-later"` to `"GPL-3.0-or-later"`

#### [MODIFY] [docs/ARCHITECTURE.md](file:///Users/ais/Projects/pgn-chess-tree/docs/ARCHITECTURE.md)
- Update license line from AGPL to GPL-3.0
- Remove BlindBase references, replace with generic "desktop and web workstations"

---

### Component 3: README Overhaul

#### [MODIFY] [README.md](file:///Users/ais/Projects/pgn-chess-tree/README.md)

Complete rewrite with the following structure:

1. **Logo + Name** — Embed the chesstree SVG logo (`assets/svg/logo.svg`) centered at top
2. **Badges** — npm version (pointing to `chesstree`), license (GPL-3.0), TypeScript, tests passing
3. **One-line hero hook**:
   > *"The Lichess analysis tree — extracted, optimized, and packaged as a standalone npm library with full PGN import/export."*
4. **"Why chesstree?"** section — 3-bullet value proposition:
   - Built from the actual Lichess source code (`ui/lib/src/tree/`) — the same tree powering millions of games
   - Extended beyond Lichess: full PGN import/export pipeline, MRU path cache, zero-allocation traversal
   - Single `npm install` — no need to extract code from a monorepo
5. **Comparison table** — Feature matrix vs chess.js, chessops, @jackstenglein/chess, cm-chess showing chesstree's unique full-CRUD advantage
6. **Highlights & Features** — Keep existing but tighten wording, remove BlindBase mentions
7. **Installation** — `npm install chesstree`
8. **Quick Start** — Update import paths from `'pgn-chess-tree'` to `'chesstree'`
9. **API Reference** — Keep existing table
10. **Performance & Architecture** — Keep link to ARCHITECTURE.md
11. **Contributing** — Updated link to `itshak/chesstree`
12. **License & Attribution** — Updated to GPL-3.0, keep Lichess and chessops attribution, no BlindBase

---

### Component 4: Promotion Strategy Document

#### [NEW] [docs/strategy.md](file:///Users/ais/Projects/pgn-chess-tree/docs/strategy.md)

A comprehensive promotion playbook (gitignored — not published) covering:

1. **Positioning Statement** — "The standalone Lichess tree for everyone"
2. **Phase 1: Foundation (Week 1–2)**
   - README polish (done as part of this plan)
   - Deploy `pgn-react-app` to GitHub Pages as live demo
   - SEO keywords and GitHub Topics
3. **Phase 2: Content Marketing (Week 2–4)**
   - Blog post ideas: "How Lichess Manages Its Move Tree", "Building a Chess Study Tool with chesstree", comparison article
   - Target platforms: Dev.to, r/chessprogramming, r/lichess, Hacker News Show HN
4. **Phase 3: Ecosystem Integration (Month 2+)**
   - Build and publish `@chesstree/react` wrapper package
   - Chessground integration example
   - Interactive playground on GitHub Pages
5. **Community Channels** — Stack Overflow, Lichess Discord, chessops GitHub
6. **Metrics to Track** — npm downloads, GitHub stars, issue quality

#### [MODIFY] [.gitignore](file:///Users/ais/Projects/pgn-chess-tree/.gitignore)
- Add `docs/strategy.md` to prevent committing the strategy doc

---

### Component 5: Package Metadata & SEO

#### [MODIFY] [package.json](file:///Users/ais/Projects/pgn-chess-tree/package.json)
- Updated keywords: `"chess"`, `"pgn"`, `"parser"`, `"tree"`, `"variations"`, `"lichess"`, `"chessops"`, `"chessground"`, `"analysis"`, `"annotation"`, `"rav"`, `"subvariation"`, `"study"`, `"game-tree"`, `"move-tree"`, `"opening-explorer"`

---

### Component 6: Quality Improvements

#### [NEW] [CHANGELOG.md](file:///Users/ais/Projects/pgn-chess-tree/CHANGELOG.md)
- v2.0.0: Rebranded from `pgn-chess-tree` to `chesstree`, switched license from AGPL-3.0 to GPL-3.0, overhauled README
- Retroactive entries for v1.3.0 and earlier

#### [MODIFY] [.gitignore](file:///Users/ais/Projects/pgn-chess-tree/.gitignore)
- Add `dist/` (build artifact, should not be committed)
- Add `docs/strategy.md` (internal strategy, not published)

---

## Verification Plan

### Automated Tests
```bash
npm run build
npm test
```

### Manual Verification
- Verify `package.json` has name `chesstree`, version `2.0.0`, license `GPL-3.0-or-later`
- Verify all URLs point to `itshak/chesstree`
- Verify no BlindBase references remain (except possibly ARCHITECTURE.md history context)
- Verify README renders correctly on GitHub (logo, badges, tables, code blocks)
- Verify `docs/strategy.md` is gitignored
- Verify LICENSE file contains GPL-3.0 text (not AGPL)
- Verify CONTRIBUTING.md, SECURITY.md, ARCHITECTURE.md all reference `chesstree` and GPL-3.0
- Verify logo file exists at `assets/svg/logo.svg` with green fill (`#0F5724`)
- Verify CHANGELOG.md is present and accurate
- Do a dry-run `npm pack` and inspect the tarball contents
