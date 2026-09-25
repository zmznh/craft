#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/cacdcda91e2a553a3428b56c1abe9efea74036f876cca8d3e02c2f4e2463cc53/contract';
import startContract from '../../snapshots/cacdcda91e2a553a3428b56c1abe9efea74036f876cca8d3e02c2f4e2463cc53/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/ef4a58cad73dc3f878c3c77414fe12a3c3c48300d926dc5b7c4191dc3c7d2bbd/contract';
import endContract from '../../snapshots/ef4a58cad73dc3f878c3c77414fe12a3c3c48300d926dc5b7c4191dc3c7d2bbd/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'document_members',
        columns: [
          col('addedBy', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('documentId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('editor'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'yjs_document_states',
        columns: [
          col('bytes', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('documentId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('state', 'bytea', { notNull: true, codecRef: { codecId: 'pg/bytea@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'whiteboards',
        column: col('sharePermission', 'text', {
          notNull: true,
          default: lit('off'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'whiteboards',
        column: col('shareToken', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'whiteboards',
        column: col('shareVersion', 'int4', {
          notNull: true,
          default: lit(0),
          codecRef: { codecId: 'pg/int4@1' },
        }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'document_members',
        constraint: 'document_members_documentId_userId_key',
        columns: ['documentId', 'userId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'whiteboards',
        constraint: 'whiteboards_shareToken_key',
        columns: ['shareToken'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'yjs_document_states',
        constraint: 'yjs_document_states_documentId_key',
        columns: ['documentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'document_members',
        index: 'document_members_documentId_idx_825ef746',
        columns: ['documentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'document_members',
        index: 'document_members_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'document_members',
        foreignKey: {
          name: 'document_members_documentId_fkey',
          columns: ['documentId'],
          references: { schema: 'public', table: 'documents', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'document_members',
        foreignKey: {
          name: 'document_members_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'yjs_document_states',
        foreignKey: {
          name: 'yjs_document_states_documentId_fkey',
          columns: ['documentId'],
          references: { schema: 'public', table: 'documents', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
