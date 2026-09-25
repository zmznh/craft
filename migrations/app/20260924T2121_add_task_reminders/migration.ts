#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/2ec5c34e721bc97a25c3e6c4852dceec2798d7e7005ca5aeb35a07aad744368c/contract';
import endContract from '../../snapshots/2ec5c34e721bc97a25c3e6c4852dceec2798d7e7005ca5aeb35a07aad744368c/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/ef4a58cad73dc3f878c3c77414fe12a3c3c48300d926dc5b7c4191dc3c7d2bbd/contract';
import startContract from '../../snapshots/ef4a58cad73dc3f878c3c77414fe12a3c3c48300d926dc5b7c4191dc3c7d2bbd/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'tasks',
        column: col('completedAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'tasks',
        column: col('recurrence', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'tasks',
        column: col('recurrenceEnd', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'tasks',
        column: col('remindAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
