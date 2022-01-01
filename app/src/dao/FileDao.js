import FileUploadRequest from "../model/FileUploadRequest.js";
import PostgresClient from "./PostgresClient.js";

export default class FileDao {
  constructor(postgresClient) {
    this.client = postgresClient;
    this.table = 'file_request';
    if (!(this.client instanceof PostgresClient)) {
      throw new Error("FileDao requires an instance of PostgresClient in the constructor");
    }
  }

  async getById(id) {
    try {
      const result = await this.client.query(`SELECT * FROM ${this.table} WHERE id = $1::uuid`, [id]);
      if (result && result.rows && result.rows.length) {
        const row = result.rows[0];
        return new FileUploadRequest({
          id: row.id,
          name: row.file_name,
          mimeType: row.mime_type,
          destination: {
            bucket: row.destination_bucket,
            path: row.destination_path
          },
          status: row.file_status,
          fullPath: row.full_path,
          dateCreated: new Date(row.date_created),
          lastModified: row.last_modified ? new Date(row.last_modified) : undefined
        });
      }
    } catch (e) {
      console.error("Error getting file request by id", id, e);
    }
    return null;
  }

  async create({id, name, mimeType, destination, status, fullPath}) {
    const {bucket, path} = destination || {};
    try {
      const dateNow = new Date().toLocaleString();
      const result = await this.client.query(`
        INSERT INTO file_request 
        (
          id, 
          file_name, 
          mime_type, 
          file_status, 
          destination_bucket, 
          destination_path, 
          full_path,
          date_created, 
          last_modified
        ) VALUES(
          $1::uuid,     /* id */
          $2::varchar,  /* file_name */
          $3::varchar,  /* mime_type */
          $4::varchar,  /* file_status */
          $5::varchar,  /* destination_bucket */
          $6::varchar,  /* destination_path */
          $7::varchar,  /* full_path */
          $8::timestamp,  /* date_created */
          $9::timestamp   /* last_modified */
        )`,
      [
        id, 
        name, 
        mimeType, 
        status, 
        bucket, 
        path, 
        fullPath,
        dateNow, 
        dateNow 
      ]);
      if (result && result.rowCount) {
        return new FileUploadRequest({
          id, 
          name, 
          mimeType, 
          destination,
          status,
          fullPath,
          dateCreated: dateNow,
          lastModified: dateNow
        });
      }
    } catch (e) {
      console.error("Error creating file_request record", e);
    }
    return null;
  }

  async update(current, updated) {
    const id = current.id;
    const name = updated.name || current.name;
    const mimeType = updated.mimeType || current.mimeType;
    const destination = updated.destination || current.destination;
    const status = updated.status || current.status;
    const fullPath = updated.fullPath || current.fullPath;
    const dateNow = new Date().toLocaleString();

    try {
      const result = await this.client.query(`
        UPDATE 
          file_request 
        SET 
          file_name = $1::varchar,
          mime_type = $2::varchar, 
          file_status = $3::varchar, 
          destination_bucket = $4::varchar, 
          destination_path = $5::varchar, 
          full_path = $6::varchar, 
          last_modified = $7::timestamp
        WHERE
          id = $8::uuid
        `,
      [
        name, 
        mimeType, 
        status, 
        destination.bucket, 
        destination.path, 
        fullPath,
        dateNow, 
        id
      ]);
      if (result) {
        return new FileUploadRequest({
          ...current,
          id,
          name,
          mimeType,
          destination,
          status,
          fullPath,
          lastModified: dateNow
        });
      }
    } catch (e) {
      console.error("Error updating file_request record",e);
    }
    return null;
 }

  async filterByStatus({status, limit = 30, offset = 0}) {
    try {
      const result = await this.client.query(`
        SELECT * 
        FROM ${this.table}
        WHERE file_status = $1::varchar 
        ORDER BY date_created ASC
        LIMIT $2 OFFSET $3
      `, [
          status,
          limit,
          offset
      ]);
      const rows = result && result.rows;
      if (Array.isArray(rows)) {
        return rows.map((row) => new FileUploadRequest({
          id: row.id,
          name: row.file_name,
          mimeType: row.mime_type,
          destination: {
            bucket: row.destination_bucket,
            path: row.destination_path
          },
          status: row.file_status,
          fullPath: row.full_path,
          dateCreated: row.date_created,
          lastModified: row.last_modified
        }));
      }
    } catch (e) {
      console.error("Error getting file_request by status", e);
    }
    return null;
  }
}