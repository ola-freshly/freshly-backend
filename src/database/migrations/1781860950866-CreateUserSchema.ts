import { MigrationInterface } from 'typeorm';

/**
 * No-op. This migration originally re-created the same tables as InitialSchema
 * (only the `users` table differed: it had `phone` instead of the verification
 * columns). Running it after InitialSchema fails with "relation already exists".
 *
 * The correct history is InitialSchema (base tables incl. verification columns)
 * + AddPhoneToUsers (adds `phone` + unique constraint), so this migration is
 * emptied. It stays recorded in environments that already ran it, while fresh
 * databases skip it cleanly.
 */
export class CreateUserSchema1781860950866 implements MigrationInterface {
  name = 'CreateUserSchema1781860950866';

  public async up(): Promise<void> {
    // intentionally empty — superseded by InitialSchema + AddPhoneToUsers
  }

  public async down(): Promise<void> {
    // intentionally empty
  }
}
