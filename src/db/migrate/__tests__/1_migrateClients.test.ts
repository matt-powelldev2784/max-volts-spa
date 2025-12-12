import { describe, it, expect } from 'vitest';
import { convertPostgrestClientsToSupabaseClients } from '../1_migrateClients';

describe('convertPostgrestClientsToSupabaseClients', () => {
  it('maps legacy clients to Supabase payload', () => {
    const createdAt = new Date('2024-01-01T10:30:00Z');
    const result = convertPostgrestClientsToSupabaseClients([
      {
        id: 1,
        name: 'Name',
        company_name: 'Company name',
        email: 'email@email.com',
        address1: 'Address 1',
        address2: null,
        postcode: 'AB1 2CD',
        tel: '1234567890',
        is_hidden: false,
        created_at: createdAt,
      },
    ]);

    expect(result).toEqual([
      {
        legacy_id: 1,
        name: 'Name',
        company: 'Company name',
        email: 'email@email.com',
        address1: 'Address 1',
        address2: null,
        city: null,
        county: null,
        post_code: 'AB1 2CD',
        telephone: '1234567890',
        is_visible_to_user: true,
        created_at: createdAt.toISOString(),
      },
    ]);
  });
});
