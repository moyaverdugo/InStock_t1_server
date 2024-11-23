import express from 'express';
import knex from '../db/knex.js'; 

const router = express.Router();


// Katie for you to review //////////////////////////////////////////////////////////////////////////////////////

// Back-End: API to GET List of All Warehouses -----------------------------------------------------------------
router.get('/', async (_req, res) => {
  try {
    // Fetch all warehouses from the database using Knex
    const warehouses = await knex('warehouses').select('*');

    res.status(200).json(warehouses); // Return the list of warehouses with a 200 status
  } catch (err) {
    res.status(500).send('Error fetching warehouses');
  }
});
// END Back-End: API to GET List of All Warehouses -------------------------------------------------------------

// Back-End: API to GET a Single Warehouse ---------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  const warehouseId = req.params.id;

  try {
    // Fetch warehouse data from the database using Knex
    const warehouse = await knex('warehouses').where('id', warehouseId).first();

    if (warehouse) {
      res.status(200).json(warehouse);
    } else {
      res.status(404).send('Warehouse not found');
    }
  } catch (err) {
    res.status(500).send('Error fetching warehouse data');
  }
});
// END Back-End: API to GET a Single Warehouse ------------------------------------------------------------------

///END Katie review//////////////////////////////////////////////////////////////////////////////////////////////



// Edward for you to review /////////////////////////////////////////////////////////////////////////////////////

// Back-End: API to PUT/EDIT a Warehouse ------------------------------------------------------------------------
// Function for phone number validation
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+1\s\(\d{3}\)\s\d{3}-\d{4}$/;
  return phoneRegex.test(phone);
};

// Function for email validation
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// PUT /api/warehouses/:id - Update a warehouse by ID
router.put('/:id', async (req, res) => {
  const { warehouse_name, address, city, country, contact_name, contact_position, contact_phone, contact_email } = req.body;
  const warehouseId = req.params.id;

  // Validation: Ensure all fields are provided
  if (!warehouse_name || !address || !city || !country || !contact_name || !contact_position || !contact_phone || !contact_email) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Validate phone number format
  if (!validatePhoneNumber(contact_phone)) {
    return res.status(400).json({ message: "Invalid phone number format. Expected format: +1 (XXX) XXX-XXXX." });
  }

  // Validate email format
  if (!validateEmail(contact_email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  try {
    // Check if the warehouse exists
    const existingWarehouse = await knex('warehouses').where({ id: warehouseId }).first();
    if (!existingWarehouse) {
      return res.status(404).json({ message: "Warehouse not found." });
    }

    // Update warehouse details
    const [updatedWarehouse] = await knex('warehouses')
      .where({ id: warehouseId })
      .update({
        warehouse_name,
        address,
        city,
        country,
        contact_name,
        contact_position,
        contact_phone,
        contact_email
      })
      .returning('*'); // Return the updated warehouse data

    // Send the updated warehouse data as the response
    res.status(200).json(updatedWarehouse);
  } catch (err) {
    res.status(500).json({ message: "Error updating warehouse." });
  }
});
// END Back-End: API to PUT/EDIT a Warehouse ------------------------------------------------------------------------

// Back-End: API to CREATE a New Warehouse ------------------------------------------------------------

router.post('/', async (req, res) => {
  const { warehouse_name, address, city, country, contact_name, contact_position, contact_phone, contact_email } = req.body;

  // Validation: Ensure all fields are provided
  if (!warehouse_name || !address || !city || !country || !contact_name || !contact_position || !contact_phone || !contact_email) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Validate phone number format
  if (!validatePhoneNumber(contact_phone)) {
    return res.status(400).json({ message: "Invalid phone number format. Expected format: +1 (XXX) XXX-XXXX." });
  }

  // Validate email format
  if (!validateEmail(contact_email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  try {
    // Insert the new warehouse into the database
    const [newWarehouse] = await knex('warehouses').insert({
      warehouse_name,
      address,
      city,
      country,
      contact_name,
      contact_position,
      contact_phone,
      contact_email
    }).returning('*'); // Return the newly created warehouse data

    // Send the newly created warehouse data as the response
    res.status(201).json(newWarehouse);
  } catch (err) {
    res.status(500).json({ message: "Error creating warehouse." });
  }
});
// END Back-End: API to CREATE a New Warehouse ------------------------------------------------------------

///END Edward review//////////////////////////////////////////////////////////////////////////////////////////////



// This is my part, so you can review it if you want. It is super simple though //////////////////////////////////

// DELETE a warehouse and its associated inventory -----------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete all inventory associated with the warehouse
    await knex('inventories')
      .where('warehouse_id', id)
      .del();

    // Delete the warehouse
    const deleted = await knex('warehouses')
      .where('id', id)
      .del();

    if (deleted) {
      res.status(200).send(`Warehouse with ID ${id} and its inventory were deleted.`);
    } else {
      res.status(404).send(`Warehouse with ID ${id} not found.`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting warehouse and associated inventory.');
  }
});

export default router;