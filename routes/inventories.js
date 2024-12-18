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

// PUT /api/inventories/:id - Update an item by ID
router.put("/:id", async (req,res) => {
    const {warehouse_id, item_name, description, category, status, quantity} = req.body;
    const itemId = req.params.id;

    // Check all fields are filled.
    if(!warehouse_id || !item_name || !description || !category || !status){
        return res.status(400).json({ message: "All fields are required." });
    }

    //Validate type of quantity
  if( typeof(quantity) !== "number" ) {
    return res.status(400).json({ message: "Quantity must be a number" });
  }

  if (status === "In Stock" && !quantity) {
    return res.status(400).json({ message: "Quantity is needed for item instock" });
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
            res.status(200).json({message:`Item with ID ${itemId} in inventory were deleted.`});
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