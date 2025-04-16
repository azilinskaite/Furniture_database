const { MongoClient, ObjectId } = require("mongodb");

// using mogodb locally
const client = new MongoClient("mongodb://localhost:27017");
 
const connectToDB = async () => {
  client.connect();
  return client.db("furniture");
  }

// METHODS FOR VIEWING, SENDING & UPDATING DATA TO DATABASE

// get all the items
const getAllProducts = async () => {
    try {
      const db = await connectToDB();
      const productsCollection = db.collection("products");
      const allProducts = await productsCollection.find({}).toArray();
      return allProducts;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }
};

// get items from specific category
const getProductsByCategory = async (category) => {
  try {
    const db = await connectToDB();
    const productsCollection = db.collection("products");
    const categoryProducts = await productsCollection.find({ category }).toArray();
    return categoryProducts;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw new Error("Failed to fetch products by category");
  }
};

// get items by specific designer
const getProductsByDesigner = async (designer) => {
  try {
    const db = await connectToDB();
    const productsCollection = db.collection("products");
    // make case insensitive
    const designerProducts = await productsCollection.find({
      designer: { $regex: new RegExp(`^${designer}$`, "i") }
    }).toArray();
    return designerProducts;
  } catch (error) {
    console.error("Error fetching products by designer:", error);
    throw new Error("Failed to fetch products by designer");
  }
};

// post a new item
const sendNewItem = async (itemData) => {
  try {
    const db = await connectToDB();
    const itemsCollection = db.collection("products");
    const existingItem = await itemsCollection.findOne({
      category: itemData.category,
      photo: itemData.photo,
      design_name: itemData.design_name,
      designer: itemData.designer,
      materials: itemData.materials,
      year_created: itemData.year_created,
    });
    if (existingItem) {
      return { success: false, message: "Item already exists" };
    }
    const result = await itemsCollection.insertOne(itemData);
    return { success: true, insertedId: result.insertedId };
  } catch (error) {
    if (error.code === 11000) {
      return { success: false, message: "Duplicate item" };
    }
    console.error("Error adding new item:", error);
    throw new Error("Failed to add new item");
  }
};

// update a specific existing item (by id)
const updateItem = async (id, updatedData) => {
  try {
    const db = await connectToDB();
    const itemsCollection = db.collection("products");
    const result = await itemsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData } 
    );
    if (result.matchedCount === 0) {
      return { success: false, message: "Item not found" };
    }
    return { success: true, message: "Item successfully updated" };
  } catch (error) {
    console.error("Error updating item:", error);
    throw new Error("Failed to update item");
  }
};

// delete a specific item by id
const deleteItem = async (id) => {
  try {
    const db = await connectToDB();
    const itemsCollection = db.collection("products");
    const result = await itemsCollection.deleteOne({ 
      _id: new ObjectId(id) 
    });
    if (result.deletedCount === 0) {
      return { success: false, message: "Item not found" };
    }
    return { success: true, message: "Item deleted successfully" };
  } catch (error) {
    console.error("Error deleting item:", error);
    throw new Error("Failed to delete item");
  }
};

// delete a specific item by name
const deleteItemByDesignName = async (designName) => {
  try {
    const db = await connectToDB();
    const itemsCollection = db.collection("products");

    // make case insensitive
    const result = await itemsCollection.deleteOne({ design_name: { $regex: new RegExp(`^${designName}$`, "i") } });
    if (result.deletedCount === 0) {
      return { success: false, message: "Item not found" };
    }
    return { success: true, message: "Item deleted successfully" };
  } catch (error) {
    console.error("Error deleting item by design_name:", error);
    throw new Error("Failed to delete item");
  }
};

module.exports = { getAllProducts, sendNewItem, getProductsByCategory, getProductsByDesigner, updateItem, deleteItem, deleteItemByDesignName };