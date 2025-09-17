import {Pool} from 'pg';
 export const pool = new Pool({
 	user:"postgres",
 	host:"localhost",
 	database: "tasks_db",
 	password:"rasheed",
 	port:5432
 }
 	);