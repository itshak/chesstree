# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-08-27

### Changed
- **Rebranded** from `pgn-chess-tree` to `chesstree`
- **License** switched from AGPL-3.0-or-later to GPL-3.0-or-later (matching upstream `chessops`)
- **README** completely overhauled with Lichess heritage story, comparison table, and new branding
- **Logo** added — dark green tree with black chess pieces as SVG

### Added
- CHANGELOG.md
- Expanded npm keywords for better discoverability

## [1.3.0] - 2025

### Added
- PGN header roundtrip support (all standard and custom tags preserved)
- Unknown/custom PGN tag preservation
- Clock annotation support

## [1.2.0] - 2025

### Added
- 64-entry MRU path cache for O(1) active path lookups
- Zero-allocation iterative path traversal
- Board shape (arrows/highlights) support

## [1.1.0] - 2025

### Added
- Deep variation nesting (unlimited RAV depth)
- Variation promotion (`promoteAt`)
- Tree merge support

## [1.0.0] - 2025

### Added
- Initial release
- PGN import with full variation tree parsing
- PGN export with lossless roundtrip
- TreeWrapper API (nodeAtPath, addNode, deleteNodeAt, etc.)
- Null move support (Z0, --, null)
- NAG and comment support
