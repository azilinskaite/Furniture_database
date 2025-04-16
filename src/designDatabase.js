// const { response } = require("express");
const { MongoClient, ObjectId } = require("mongodb");

// when using mogodb locally
const client = new MongoClient("mongodb://localhost:27017");

//when using atlas NOT WORKING!
// const client = new MongoClient("mongodb+srv://AdeleZi:MongoMombo66!@cluster0.o4hcxik.mongodb.net/");
 
// using mongodb locally
const connectToDB = async () => {
  client.connect();
  return client.db("furniture");
  }

  const dbName = "furniture";

// const connectToDB = async () => {
//     try {
//         await client.connect();
//         console.log("Connected to MongoDB Atlas");
//         return client.db(dbName);
//     } catch (error) {
//         console.error("Error connecting to MongoDB Atlas:", error);
//     }
// };


// METHODS THAT WILL BE USED TO SEND (CRUD) DATA TO DATABASE

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

const {
  category,
  photo,
  design_name,
  designer,
  materials,
  year_created,
  style,
  stock,
  brand,
  market_price,
} = itemData;

const db = await connectToDB();
const itemsCollection = db.collection("products");

const existingItem = await itemsCollection.findOne({
  category,
  photo,
  design_name,
  designer,
  materials,
  year_created,
});

if (existingItem) {
  return { success: false, message: "Item already exists" };
}

const result = await itemsCollection.insertOne({
  category,
  photo,
  design_name,
  designer,
  materials,
  year_created,
  style,
  stock,
  brand,
  market_price,
});

return { success: true, insertedId: result.insertedId };

//add catch error
}

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