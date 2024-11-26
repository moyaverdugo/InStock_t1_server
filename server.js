import express from 'express';
import cors from 'cors';
import warehousesRouter from './routes/warehouses.js'; 
import inventoriesRouter from './routes/inventories.js'; 

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/warehouses', warehousesRouter);
app.use('/api/inventories', inventoriesRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});