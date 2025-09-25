import express from 'express';
import {createTask, getTasks, updateTask,deleteTask, signUp, findUser} from './src/services/services.js';
//import {dirname} from 'path';
//import {fileURLToPath} from 'url';
import cors from 'cors';
import bcrypt from 'bcrypt';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const app = express();
const port = 3000;

const authCheck = (req,res,next) =>{
	try{
	const authHeader = req.headers.authorization;
	if(!authHeader){
		return res.status(401).json({message: "Authentication header not found"});
	}
	const tokenarr = authHeader.split(' ');
	const token = tokenarr[1];
	if(!token){
		return res.status(401).json({message:"Authentication token not found"});
	}

	const verifyJWT = jwt.verify(token, process.env.JWT_SECRET);

	req.user = verifyJWT;
	next();
	}catch(e){
				console.error(e)
				return res.status(401).json({message:"Invalid or expired token", error:e});
		}
}







app.use(express.json());
app.use(cors());


app.post('/api/tasks/signup', async(req,res)=>{
	try{
		const {username,email,password} = req.body;
	if(!username || !password || !email){
		return res.status(400).json({message:"username, password or email not provided"});
	}
	if(!validator.isLength(username, {min:3})){
		return res.status(400).json({message:"username must be at last 3 characters long"});
	}

	if(!validator.isStrongPassword(password,{
		minLength:6,
		minLowerCase:1,
		minUpperCase:1,
		minNumbers:1
	})){
		return res.status(400).json({message:"weak password"});
	}

	if(!validator.isEmail(email)){
		return res.status(400).json({message:"Invalid email"});
	}

	const salt = await bcrypt.genSalt(10);
	const hashPassword = await bcrypt.hash(password,salt);

	const sendToDb = await signUp(username,email,hashPassword);

	return res.status(201).json({message:"user created successfuly", rowCount:sendToDb});

	}
	
	catch(e){
		console.error(e);
		return res.status(500).json({message:"Internal Server Error"});
	}


});


app.post('/api/tasks/login', async(req,res)=>{
	try{
		const {username, password} = req.body;
		const user = await findUser(username);
		//console.log(user);
		if (user.length === 0){
			return res.status(404).json({message:"Username or email not found"});
		}

		const passwordInDb = user[0].password;

		const passwordCheck = await bcrypt.compare(password, passwordInDb);

		if(!passwordCheck){
			return res.status(400).json({message:"Invalid password"});
		}

		const token = jwt.sign({id:user[0].id}, process.env.JWT_SECRET, {expiresIn:'1hr'})

		return res.status(200).json({message:"Login successful", jwt:token, username:user[0].username,email:user[0].email});



	}
	catch(e){
		console.error(e);
		return res.status(500).json({message:"Internal Server Error"});
	}

});

app.post('/api/tasks/logout', async(req,res)=>{
	return res.status(200).json({message:"logged out successfully"});
})




app.post('/api/tasks', authCheck, async (req,res)=>{
	try{
		const {title,description } = req.body;
		const user_id = req.user.id;
		const taskInserted = await createTask(title, description,user_id);
		return res.status(201).json({message:"Task Created", task:taskInserted});
	}
	catch(e){
		console.error(e);
		res.status(500).json({error:'Internal Server Error'});

	}

});

app.get('/api/tasks', authCheck, async(req,res)=>{
	try{
		const user_id = req.user.id;
		const allTasks = await getTasks(user_id);
		return res.status(200).json({message:"tasks retrieved",tasks:allTasks});
	}
	catch(e){
		console.error(e);
		res.status(500).json({error:'Internal Server Error'});
	}
});


app.patch('/api/tasks/:id', authCheck, async (req,res) =>{
		try {
			const {title, description} = req.body;
			const id = req.params.id;
			const user_id = req.user.id;
				const result = await updateTask(title,description,id,user_id);
				return res.status(200).json({message:"task updated",task:result});
		}catch(e){
			console.error(e);
			res.status(500).json({error:"Internal Server Error"});
		}
});


app.delete('/api/tasks/:id', authCheck, async(req,res)=>{
	try {
			const {id} = req.params;
			const user_id = req.user.id;
			const result = await deleteTask(id,user_id);
			if (result === 1){
			return res.status(204).json({message:"task deleted successfully"});
		}
		else{
			res.status(404).json({error:"NOT FOUND"})
		}
			}
			catch(e){
				console.error(e);
				res.status(500).json({error:"Internal Server Error"});
			}
})





app.listen(port, ()=>{
	console.log(`Server is running on http://localhost:${port}`)
});

