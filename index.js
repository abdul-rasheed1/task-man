import express from 'express';
import {createTask, getTasks, updateTask,deleteTask} from './src/services/services.js';
//import {dirname} from 'path';
//import {fileURLToPath} from 'url';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());



app.post('/api/task',async (req,res)=>{
	try{
		const {title,description } = req.body;
		const taskInserted = await createTask(title, description);
		res.json(taskInserted);
	}
	catch(e){
		console.error(e);
		res.status(500).json({error:'Internal Server Error'});

	}

});

app.get('/api/task', async(req,res)=>{
	try{
		const allTasks = await getTasks();
		res.json(allTasks);
	}
	catch(e){
		console.error(e);
		res.status(500).json({error:'Internal Server Error'});
	}
});


app.put('/api/task/:id', async (req,res) =>{
		try {
			const {title, description} = req.body;
			const id = req.params.id;
			if (title || description){
				const result = await updateTask(title,description,id);
				res.json(result);
			}
		}catch(e){
			console.error(e);
			res.status(500).json({error:"Internal Server Error"});
		}
})


app.delete('/api/task/:id', async(req,res)=>{
	try {
			const {id} = req.params;
			const result = await deleteTask(id);
			if (result === 1){
			res.json({message:"task deleted successfully"});
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

