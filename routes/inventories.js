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

// GET /api/inventories/:id
// router.get("/:id", async (req, res) => {
router.get('/:id', async(req,res) => {
  try {
    const inventoryItem = await knex('inventories')
      .join('warehouses', 'inventories.warehouse_id', 'warehouses.id')
      .select(
          'inventories.id',
          'warehouses.warehouse_name',
          'inventories.item_name',
          'inventories.description',
          'inventories.category',
          'inventories.status',
          'inventories.quantity'
      )
      .where('inventories.id',req.params.id)
      .first();
    res.status(200).json(inventoryItem);
    if(!inventoryItem) {
      return res.status(404).json({ message: "Item not found" });
    }
  } catch(error) {
    console.error("Error fetching inventory item:", error);
    res.status(500).json({ message: "Error fetching inventory item" });
  }
})
  
export default router;