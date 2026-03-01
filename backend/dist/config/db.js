"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.pool = void 0;
const pg_1 = require("pg");
const env_1 = require("./env");
exports.pool = new pg_1.Pool(env_1.config.db);
exports.pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
const query = (text, params) => exports.pool.query(text, params);
exports.query = query;
