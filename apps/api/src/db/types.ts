import { db } from "./index.js";

type db =  typeof db;
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type DBTransaction = db | Transaction;
