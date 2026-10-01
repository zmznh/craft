export type { MentionCandidate } from '@/actions/document/members';
import type { MentionCandidate } from '@/actions/document/members';

export function mentionLabel(candidate: MentionCandidate): string {
  const name = candidate.name?.trim();
  return name ? name : candidate.email;
}

/** Only a mention that carries a document can be opened; a person chip cannot. */
export function mentionIsPerson(attrs: {
  documentId?: string | null;
  userId?: string | null;
}): boolean {
  return !attrs.documentId;
}

export function rankMentionCandidates(
  candidates: MentionCandidate[],
  query: string,
  limit: number,
): MentionCandidate[] {
  const needle = query.trim().toLowerCase();
  const seen = new Set<string>();
  const leading: MentionCandidate[] = [];
  const embedded: MentionCandidate[] = [];

  for (const candidate of candidates) {
    if (seen.has(candidate.userId)) continue;
    seen.add(candidate.userId);

    if (!needle) {
      leading.push(candidate);
      continue;
    }
    const name = mentionLabel(candidate).toLowerCase();
    const email = candidate.email.toLowerCase();
    if (name.startsWith(needle) || email.startsWith(needle)) leading.push(candidate);
    else if (name.includes(needle) || email.includes(needle)) embedded.push(candidate);
  }

  return leading.concat(embedded).slice(0, limit);
}
