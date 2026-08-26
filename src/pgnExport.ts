import { INITIAL_FEN } from 'chessops/fen';
import { Game } from './types';
import { fixCrazySan } from './utils';
import { TreeWrapper } from './tree';

interface AnalyseCtrl {
  data: { game: Game };
  tree: TreeWrapper;
}

const plyPrefix = (node: Tree.Node): string =>
  `${Math.floor((node.ply + 1) / 2)}${node.ply % 2 === 1 ? '. ' : '... '}`;

const escapeComment = (text: string): string => text.replace(/\\/g, '\\\\').replace(/}/g, '\\}');

const renderComments = (comments: Tree.Comment[] | undefined): string => {
  if (!comments || comments.length === 0) return '';
  const parts: string[] = [];
  for (let i = 0; i < comments.length; i++) {
    const text = comments[i].text?.trim();
    if (text) {
      parts.push(`{${escapeComment(text)}}`);
    }
  }
  return parts.join(' ');
};

const appendPart = (text: string, part: string): string => {
  if (!part) return text;
  return text ? `${text} ${part}` : part;
};

const renderMoveTxt = (node: Tree.Node, forcePly: boolean): string => {
  let text = renderComments(node.startingComments);
  const moveText = `${forcePly || node.ply % 2 === 1 ? plyPrefix(node) : ''}${fixCrazySan(node.san!)}`;
  text = appendPart(text, moveText);
  return appendPart(text, renderComments(node.comments));
};

function renderNodesTxt(node: Tree.Node, forcePly: boolean): string {
  let s = node.san ? '' : renderComments(node.comments);
  if (node.children.length === 0) return s;

  const first = node.children[0];
  s = appendPart(s, renderMoveTxt(first, forcePly || first.ply % 2 === 1));

  for (let i = 1; i < node.children.length; i++) {
    const child = node.children[i];
    s += ` (${renderMoveTxt(child, true)}`;
    const variation = renderNodesTxt(child, false);
    if (variation) s += ' ' + variation;
    s += ')';
  }

  const mainline = renderNodesTxt(first, node.children.length > 1);
  if (mainline) s += ' ' + mainline;

  return s;
}

function renderPgnTags(game: Game): string {
  const map = new Map<string, string>();

  // Add all tags from game.tags first
  if (game.tags) {
    for (const key in game.tags) {
      if (Object.prototype.hasOwnProperty.call(game.tags, key)) {
        const val = game.tags[key];
        if (val !== undefined) map.set(key, String(val));
      }
    }
  }

  const standardTags: Array<[string, string | undefined]> = [
    ['Event', game.event],
    ['Site', game.site],
    ['Date', game.date],
    ['Round', game.round],
    ['White', game.white?.name],
    ['Black', game.black?.name],
    ['Result', game.result],
    ['WhiteElo', game.whiteElo],
    ['BlackElo', game.blackElo],
    ['TimeControl', game.timeControl],
    ['Termination', game.termination],
  ];

  // Override with standard tags if they exist
  for (let i = 0; i < standardTags.length; i++) {
    const [key, value] = standardTags[i];
    if (value !== undefined) {
      map.set(key, value);
    }
  }

  if (game.variant && game.variant.key !== 'standard') {
    map.set('Variant', game.variant.name);
  }
  if (game.fen && game.fen !== INITIAL_FEN) {
    map.set('FEN', game.fen);
  }

  if (map.size === 0) return '';

  const lines: string[] = [];
  for (const [key, value] of map) {
    lines.push(`[${key} "${value}"]\n`);
  }
  return lines.join('') + '\n';
}

export function renderFullTxt(ctrl: AnalyseCtrl): string {
  const g = ctrl.data.game;
  const moves = renderNodesTxt(ctrl.tree.root, true);
  return `${renderPgnTags(g)}${moves}${moves ? ' ' : ''}${g.result}`;
}

export function renderVariationPgn(game: Game, nodeList: Tree.Node[]): string {
  const filteredNodeList: Tree.Node[] = [];
  for (let i = 0; i < nodeList.length; i++) {
    if (nodeList[i].san) filteredNodeList.push(nodeList[i]);
  }
  if (filteredNodeList.length === 0) return '';

  const parts: string[] = [];
  const first = filteredNodeList[0];
  parts.push(`${renderMoveTxt(first, true)}`);

  for (let i = 1; i < filteredNodeList.length; i++) {
    const node = filteredNodeList[i];
    parts.push(`${renderMoveTxt(node, node.ply % 2 === 1)}`);
  }

  return renderPgnTags(game) + parts.join(' ') + ' ';
}
