import {pool} from './src/db/db.js';
import {readdirSync, readFileSync} from 'fs';

const runMigration = async() =>{

	const client = await pool.connect();    //CREATE A CONNECTION TO THE DB

	try{

		const allMigrations = readdirSync('./migrations').sort();			//EXTRACT ALL FILE NAMES FROM THE MIGRATIONS FOLDER
		allMigrations.shift();				//REMOVE THE .DS_STORE FILE
		console.log(allMigrations);

		const migrationsInDb = await client.query('SELECT name FROM migrations ORDER BY name'); //CHECK THE MIGRATIONS TABLE IN THE DB FOR MIGRATIONS THAT HAVE ALREADY BEEN MADE
		console.log(migrationsInDb);
		const dbMigrationFiles = migrationsInDb.rows.map(file => file.name);  	//GET ONLY THE NAMES OF THE MIGRATION FILES
		console.log(dbMigrationFiles);

		const filesToMigrate = allMigrations.filter(file => !dbMigrationFiles.includes(file));   //COMPARE THE FILES IN THE LOCAL DIRECTORY AND THE FILES IN THE DB AND GET ALL FILES NOT ON THE DB
		console.log(filesToMigrate);

		if (filesToMigrate.length===0){							
			console.log("no migrations to be made");
			return ;
		}

		console.log(`Applying ${filesToMigrate.length} migration(s)`);

		for (const file of filesToMigrate){				//RUN SCRIPT TO MIGRATE FILES NOT ON THE DB
			const sql = readFileSync(`./migrations/${file}`, 'utf-8');
			console.log(`migrating ${file}`);
			await client.query(sql, (err,res)=>{
				if(!err){
					console.log(res.command);
				}

			});

			//UPDATE THE MIGRATIONS TABLE TO KEEP TRACK OF THE MIGRATIONS MADE
			await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);

		}

		console.log('migrations completed');
		return ;



	}catch(e){
		console.error('An error occurred', e);
	}
	finally{
		client.release();
	}
}

runMigration();