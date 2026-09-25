#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/2ec5c34e721bc97a25c3e6c4852dceec2798d7e7005ca5aeb35a07aad744368c/contract';
import startContract from '../../snapshots/2ec5c34e721bc97a25c3e6c4852dceec2798d7e7005ca5aeb35a07aad744368c/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/51be9e5814c7452c0e68fbdced58486c8ae38ac94b9c2c27575376c622d09d6f/contract';
import endContract from '../../snapshots/51be9e5814c7452c0e68fbdced58486c8ae38ac94b9c2c27575376c622d09d6f/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'document_shares',
        column: col('slug', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'document_shares',
        constraint: 'document_shares_slug_key',
        columns: ['slug'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
