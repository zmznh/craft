import { describe, expect, it } from 'vitest';
import { findFolderCycle } from './folder-tree';

const tree = [
  { id: 'root', parentId: null },
  { id: 'a', parentId: 'root' },
  { id: 'a1', parentId: 'a' },
  { id: 'b', parentId: 'root' },
];

describe('findFolderCycle', () => {
  it('allows moving a folder under its current parent', () => {
    expect(findFolderCycle(tree, 'a1', 'a')).toBeNull();
  });

  it('allows moving to an unrelated branch', () => {
    expect(findFolderCycle(tree, 'a1', 'b')).toBeNull();
  });

  it('blocks moving a parent into its own descendant', () => {
    expect(findFolderCycle(tree, 'root', 'a1')).toBe('root');
  });

  it('blocks moving a folder onto itself', () => {
    expect(findFolderCycle(tree, 'a', 'a')).toBe('a');
  });

  it('allows detaching to the top level', () => {
    expect(findFolderCycle(tree, 'a', null)).toBeNull();
  });

  it('terminates on a pre-existing loop in stored data', () => {
    const broken = [
      { id: 'x', parentId: 'y' },
      { id: 'y', parentId: 'x' },
    ];
    expect(findFolderCycle(broken, 'z', 'x')).not.toBeNull();
  });
});
