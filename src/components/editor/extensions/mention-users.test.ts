import { describe, expect, it } from 'vitest';
import { mentionIsPerson, mentionLabel, rankMentionCandidates } from './mention-users';
import type { MentionCandidate } from './mention-users';

// The candidate list a real membership query returns: name comes from the User
// account and can be null, email is always present. Every case below names a
// ranking rule the `@` menu depends on, not an incidental detail.
const people: MentionCandidate[] = [
  { userId: 'u-liam', name: 'Liam Chen', email: 'liam@example.com' },
  { userId: 'u-rebecca', name: 'Rebecca Li', email: 'rebecca@example.com' },
  { userId: 'u-zhang', name: '张三', email: 'zhang@example.com' },
  { userId: 'u-nameless', name: null, email: 'nameless@example.com' },
];

function ids(of: MentionCandidate[]) {
  return of.map((candidate) => candidate.userId);
}

describe('rankMentionCandidates', () => {
  it('keeps only candidates whose name matches the query', () => {
    expect(ids(rankMentionCandidates(people, 'zhang', 10))).toEqual(['u-zhang']);
  });

  it('matches on the email as well as the name', () => {
    expect(ids(rankMentionCandidates(people, 'rebecca@', 10))).toEqual(['u-rebecca']);
  });

  it('compares without regard to case in either direction', () => {
    expect(ids(rankMentionCandidates(people, 'LIAM', 10))).toEqual(['u-liam']);
    expect(ids(rankMentionCandidates(people, 'NAMELESS@EXAMPLE.COM', 10))).toEqual(['u-nameless']);
  });

  it('lists candidates the query starts a name with ahead of ones it only contains', () => {
    const mixed: MentionCandidate[] = [
      { userId: 'u-substring', name: 'Rebecca Li', email: 'rebecca@example.com' },
      { userId: 'u-prefix', name: 'Liam Chen', email: 'liam@example.com' },
    ];
    expect(ids(rankMentionCandidates(mixed, 'li', 10))).toEqual(['u-prefix', 'u-substring']);
  });

  it('keeps the incoming order within a ranking group', () => {
    const sameGroup: MentionCandidate[] = [
      { userId: 'u-first', name: 'alpha beta', email: 'first@example.com' },
      { userId: 'u-second', name: 'gamma beta', email: 'second@example.com' },
    ];
    expect(ids(rankMentionCandidates(sameGroup, 'beta', 10))).toEqual(['u-first', 'u-second']);
  });

  it('drops a person who appears twice, keeping the first entry', () => {
    const doubled: MentionCandidate[] = [
      { userId: 'u-liam', name: 'Liam Chen', email: 'liam@example.com' },
      { userId: 'u-zhang', name: '张三', email: 'zhang@example.com' },
      { userId: 'u-liam', name: 'Liam Chen', email: 'liam@example.com' },
    ];
    expect(ids(rankMentionCandidates(doubled, 'li', 10))).toEqual(['u-liam']);
  });

  it('returns no more than the limit', () => {
    expect(rankMentionCandidates(people, '', 2)).toHaveLength(2);
  });

  it('treats an empty query as no filter at all', () => {
    expect(ids(rankMentionCandidates(people, '', 10))).toEqual([
      'u-liam',
      'u-rebecca',
      'u-zhang',
      'u-nameless',
    ]);
  });

  it('treats a query of only whitespace as no filter', () => {
    expect(ids(rankMentionCandidates(people, '   ', 10))).toEqual([
      'u-liam',
      'u-rebecca',
      'u-zhang',
      'u-nameless',
    ]);
  });

  it('returns nothing when no candidate matches', () => {
    expect(rankMentionCandidates(people, 'nobody-here', 10)).toEqual([]);
  });
});

describe('mentionLabel', () => {
  it('labels a person with their name', () => {
    expect(mentionLabel({ userId: 'u', name: 'Liam Chen', email: 'liam@example.com' })).toBe('Liam Chen');
  });

  it('falls back to the email when the account has no name', () => {
    expect(mentionLabel({ userId: 'u', name: null, email: 'nameless@example.com' })).toBe(
      'nameless@example.com',
    );
  });

  it('falls back to the email when the name holds only spaces', () => {
    expect(mentionLabel({ userId: 'u', name: '  ', email: 'nameless@example.com' })).toBe(
      'nameless@example.com',
    );
  });
});

describe('mentionIsPerson', () => {
  it('reads a mention that points at a document as a page mention', () => {
    expect(mentionIsPerson({ documentId: 'doc-1', userId: 'u-1' })).toBe(false);
  });

  it('reads a mention that carries only a user as a person', () => {
    expect(mentionIsPerson({ documentId: null, userId: 'u-1' })).toBe(true);
  });

  it('reads a mention with no target at all as a person, because it has no page to open', () => {
    expect(mentionIsPerson({ documentId: null, userId: null })).toBe(true);
  });
});
