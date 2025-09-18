import {pool} from '../db/db.js';

export  const createTask = async(title,description)=>{
	const query = 'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING id';

	const full_query = await pool.query(query, [title,description]);
	return full_query.rows[0];

};

export const getTasks = async () => {
	const query = 'SELECT * FROM tasks';
	const full_query = await pool.query(query);
	return full_query.rows;


}

export const updateTask = async(title, description, id)=>{
	const query = "UPDATE tasks SET title = $1, description = $2 WHERE id = $3 RETURNING *";
	const full_query = await pool.query(query, [title, description, id]);
	return full_query.rows;

}

export const deleteTask = async(id) =>{
	const query = 'DELETE FROM tasks WHERE id = $1';
	const full_query = await pool.query(query, [id]);
	return full_query.rowCount;
}