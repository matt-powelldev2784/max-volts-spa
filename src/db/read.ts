import { Client } from 'pg';

const connectionString = process.env.VITE_RAILWAY_DATABASE_URL ?? process.env.DATABASE_URL;

const fetchClients = async () => {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const { rows } = await client.query('select * from "Client"');
    console.log(rows);
  } finally {
    await client.end();
  }
};

fetchClients().catch((err) => {
  console.error('Failed to fetch clients:', err);
  process.exit(1);
});
