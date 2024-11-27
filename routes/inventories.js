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

// Get a single inventory item by ID
router.get("/:id", async (req, res) => {
    try {
      const inventoryItem = await knex("inventories")
        .where({ id: req.params.id })
        .first();
      if (!inventoryItem) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.status(200).json(inventoryItem);
    } catch (error) {
      console.error("Error fetching inventory item:", error);
      res.status(500).json({ message: "Error fetching inventory item" });
    }
  });

// PUT /api/inventories/:id - Update an item by ID
router.put("/:id", async (req,res) => {
    const {warehouse_id, item_name, description, category, status, quantity} = req.body;
    const itemId = req.params.id;

    // Check all fields are filled.
    if(!warehouse_id || !item_name || !description || !category || !status || !quantity){
        return res.status(400).json({ message: "All fields are required." });
    }
    try{
        const item = await knex('inventories').where({id : itemId}).first();
        // Check item exists.
        if(!item){
            return res.status(404).json({ message: "Item not found." });
        }

        const updatedCount = await knex('inventories').where({id : itemId}).update({
            warehouse_id, item_name, description, category, status, quantity
        })
        if(updatedCount === 0){
            return res.status(404).json({ message: "Item not found, check the item id." });
        }
        const updatedItem = await knex('inventories').where({id : itemId}).first();
        res.status(200).json({message: "Item data updated successfully.", updatedItem});
    }catch (e) {
        res.status(500).json({message: "Error updating item."})
    }
})
// END Back-End: API to PUT/EDIT an item.

// DELETE an item from inventory
router.delete("/:id", async (req,res) => {
    const itemId = req.params.id;

    try {
        // Delete item by Id
        const deletedItem = await knex('inventories').where({id: itemId}).del();
        if(deletedItem){
            res.status(200).json({message:`Item with ID ${id} in inventory were deleted.`});
        } else {
            res.status(404).json({message: `Item not found, check the item id.`});
        }
    }catch (e) {
        console.log(e);
        res.status(500).json({message: 'Error deleting item from inventory.'})
    }
})
// END Back-End: API to DELETE an item.
export default router;