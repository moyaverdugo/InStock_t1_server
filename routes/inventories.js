import express from 'express';
import knex from '../db/knex.js'; 

const router = express.Router();

// Back-End: API to GET List of All inventories -----------------------------------------------------------------
// Get all inventory items with warehouse names
router.get('/', async (_req, res) => {
    try {
      // Perform a join to get the warehouse name along with the inventory data
      const inventory = await knex('inventories')
        .join('warehouses', 'inventories.warehouse_id', 'warehouses.id')
        .select(
          'inventories.id',
          'inventories.item_name',
          'inventories.description',
          'inventories.category',
          'inventories.status',
          'inventories.quantity',
          'warehouses.warehouse_name' // Include the warehouse name
        );
  
      res.status(200).json(inventory);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      res.status(500).send('Error fetching inventory data');
    }
  });
// -----------------------------------------------------------------------------------------------------------------
//POST /api/inventories
router.post('/', async(req, res) => {
  const {
    warehouse_id,
    item_name,
    description,
    category,
    status,
    quantity
  } = req.body;

  //Validate of no missing fields
  if (!warehouse_id || !item_name || !description || !category || !status ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  //Validate warehouse ID
  const foundWarehouse = await knex("warehouses")
  .where('id', warehouse_id).first()
  
  if ( !foundWarehouse ) {
    return res.status(400).json({ message: `There is no warehouse with the ID of ${warehouse_id}` });
  }

  //Validate type of quantity
  if( typeof(quantity) !== "number" ) {
    return res.status(400).json({ message: "Quantity must be a number" });
  }

  if (status === "In Stock" && !quantity) {
    return res.status(400).json({ message: "Quantity is needed for item instock" });
  }

  //Insert new inventory item to the inventories table
  try {
    const [newId] = await knex("inventories").insert({
      warehouse_id,
      item_name,
      description,
      category,
      status,
      quantity
    });

    const newInventory = await knex("inventories").where('id', newId).first();

    res.status(201).json(newInventory);
  } catch(error) {
    res.status(500).json({ message: "Can't create new inventory item" });
  }
})

export default router;