import express from 'express';
import {dirname} from 'path';
import {fileURLToPath} from 'url';

const app = express();
//app.use(express.json());

const port = 3500;

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

app.get('/', (req,res)=>{
	res.sendFile(_dirname + '/index.html');
});

app.listen(port, ()=>{
	console.log(`Server running on http://localhost:${port}`);
});