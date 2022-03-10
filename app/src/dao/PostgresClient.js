import pg from 'pg';

const Pool = pg.Pool;

let poolRef;

export const NOT_READY = "not_ready";
export const READY = "ready";

/**
 * Checks if a table exists in database
 * 
 * @param {PostgresClient} client 
 * @param {String} tableName 
 * @returns Promise - resolves a boolean
 */
const doesTableExist = async (client, tableName) => {
  let exists = false;
  const query = `
    SELECT 1
      FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
      AND c.relname = $1::text
      AND c.relkind = 'r' -- r = tables 
  `;
  try {
    const result = await client.query(query, [tableName]);
    if (result && result.rows && result.rows.length) {
      exists = true;
    }
  } catch(e) {
    console.error("error querying table exists", e);
    exists = false;
  }
  return exists;
}

/**
 * Creates tables needed for service if this is first time running
 * 
 * @param {PostgresClient} client 
 */
const initializeTables = async (client) => {
  if (!(await doesTableExist(client, 'file_request'))) {
    try {
      const result = await client.query(`
        CREATE TABLE file_request (
          id uuid NOT NULL,
          file_name varchar NOT NULL,
          mime_type varchar NOT NULL,
          destination_bucket varchar,
          destination_path varchar,
          file_status varchar NOT NULL,
          full_path varchar,
          created_by uuid,
          date_created timestamp,
          last_modified timestamp default current_timestamp,
          UNIQUE(id)
        ); 
      `);
      console.log("Finshed creating file_request table");
    } catch (e) {
      console.error("Error creating table `file_request`", e);
    }
  }
};

/**
 * Creates connection to postgres db 
 * 
 * @param {*} param0 
 * @returns 
 */
const loadPool = async ({host, database, user, password, port=5432}) => {
  return new Promise((resolve, reject) => {
    if (poolRef) {
      return resolve(poolRef);
    }
    let count = 0;
    const attempt = () => {
      count++;
      try {
        poolRef = new Pool({
          user,
          host,
          database,
          password,
          port
        });
        resolve(poolRef);
      } catch (e) {
        console.error("Received error loading postgres pool", e);
        if (count < 3) {
          console.log("Retrying postgres connection in 3 seconds");
          setTimeout(attempt, 3000);
        } else {
          reject(e);
        }
      }
    };
    if (poolRef) {
      resolve(poolRef);
    } else {
      attempt();
    }
  });
};

/**
 * Interface for interacting with the postgres db
 */
export default class PostgresClient {
  constructor({host, database, user, password, port=5432}) {
    this.host = host;
    this.database = database;
    this.user = user;
    this.password = password;

    this.status = NOT_READY;
    this.pool = null;
  }

  async init() {
    const {host, database, user, password, port} = this;
    this.pool = await loadPool({host, database, user, password, port});
    if (this.pool) {
      await initializeTables(this);
      this.status = READY;
    }
  }

  async query(query, params = []) {
    const pool = this.pool;
    return new Promise((resolve, reject) => {
      pool.query(query, params, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  isReady(){
    return this.status === READY;
  }
}