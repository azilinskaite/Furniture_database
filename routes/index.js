const Joi = require("joi");
const cors = require("cors");
const express = require("express");
const { getAllProducts, sendNewItem, getProductsByCategory, getProductsByDesigner, updateItem, deleteItem, deleteItemByDesignName } = require("../src/designDatabase");
const router = express.Router();
router.use(cors());
router.use(express.json());

const itemSchema = Joi.object({
  photo: Joi.string().required(),
  design_name: Joi.string().required(),
  designer: Joi.string().required(),
  materials: Joi.array().required(),
  year_created: Joi.number().integer().required(),
  style: Joi.array().optional(),
  stock: Joi.number().integer().optional(),
  brand: Joi.string().optional(),
  market_price: Joi.number().optional(),
});

// testing
router.get('/', function(req, res) {
  res.send("Hello");
});

// fetch all furniture
router.get("/api/items", async (req, res) => {
  try {
    const products = await getAllProducts();
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch the items" });
  }
});

// fetch all furniture in a specific category
router.get("/api/items/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const products = await getProductsByCategory(category);
    res.status(200).send(products);
  } catch (error) {
    console.error("Error fetching items by category:", error);
    res.status(500).send({ error: "Failed to fetch the items" });
  }
});

// fetch all furniture by a specific designer
router.get("/api/items/designer/:designer", async (req, res) => {
  try {
    const { designer } = req.params;
    const products = await getProductsByDesigner(designer);
    if (products.length === 0) {
      return res.status(404).send({ message: "No products found for this designer" });
    }
    res.status(200).send(products);
  } catch (error) {
    console.error("Error fetching items by designer:", error.message || error);
    res.status(500).send({ error: "Failed to fetch the items" });
  }
});

// post an item in a specific category
router.post("/api/items/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const { error, value } = itemSchema.validate(req.body);
    if (error) {
      return res.status(400).send({ error: error.details[0].message });
    }
    const itemData = { ...value, category };
    const result = await sendNewItem(itemData);
    if (!result.success) {
      return res.status(400).send({ error: result.message });
    }
    res.status(201).send({
      message: "Item successfully added",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Error in POST /api/items:", error);
    res.status(500).send({ error: "Failed to add item" });
  }
});

//update a specific item (full object)
router.put("/api/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // not sending id and category in the body
    const { _id, category, ...updatedData } = req.body;
    const { error } = itemSchema.validate(updatedData);
    if (error) {
      return res.status(400).send({ error: error.details[0].message });
    }
    const result = await updateItem(id, updatedData);
    if (!result.success) {
      return res.status(404).send({ error: result.message });
    }
    res.status(200).send({ message: result.message });
  } catch (error) {
    console.error("Error in PUT /api/items/:id:", error);
    res.status(500).send({ error: "Failed to update item" });
  }
});

// delete a specific item by id
router.delete("/api/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteItem(id);
    if (!result.success) {
      return res.status(404).send({ error: result.message });
    }
    res.status(200).send({ message: result.message });
  } catch (error) {
    if (error.message.includes("Invalid item")) {
      return res.status(400).send({ error: "Invalid item ID format" });
    }
    console.error("Error in DELETE ", error);
    res.status(500).send({ error: "Failed to delete item" });
  }
});

// delete a specific item by design_name
router.delete("/api/items/design/:design_name", async (req, res) => {
  try {
    const { design_name } = req.params;
    const result = await deleteItemByDesignName(design_name);
    if (!result.success) {
      return res.status(404).send({ error: result.message });
    }
    res.status(200).send({ message: result.message });
  } catch (error) {
    console.error("Error in DELETE /api/items/design/:design_name:", error);
    res.status(500).send({ error: "Failed to delete item" });
  }
});

module.exports = router;
