import {pool} from '../db/db.js';

export  const createTask = async(title,description,user_id)=>{
	const query = 'INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3) RETURNING id';

	const full_query = await pool.query(query, [title,description,user_id]);
	return full_query.rows[0];

};

export const getTasks = async (user_id) => {
	const query = 'SELECT * FROM tasks WHERE user_id = $1';
	const full_query = await pool.query(query, [user_id]);
	return full_query.rows;


}

export const updateTask = async(title, description, id, user_id)=>{
	const query = "UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description) WHERE id = $3 AND user_id = $4 RETURNING *";
	const full_query = await pool.query(query, [title, description, id, user_id]);
	return full_query.rows;

}

export const deleteTask = async(id, user_id) =>{
	const query = 'DELETE FROM tasks WHERE id = $1 AND user_id=$2 RETURNING *';
	const full_query = await pool.query(query, [id, user_id]);
	return full_query.rowCount;
}

export const signUp = async(username, email, password) => {
	const query = "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)";
	const result = await pool.query(query,[username, email, password]);
	return result.rowCount;

}

export const findUser = async(username)=>{
	const query = "SELECT * FROM users WHERE username = $1 OR email = $2";
	const result = await pool.query(query,[username, username]);
	return result.rows;
}
