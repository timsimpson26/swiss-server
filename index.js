require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const Joi = require("joi");
const mongoose = require("mongoose");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Schema
const itemSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  category:    { type: String, required: true },
  price:       { type: Number, required: true },
  description: { type: String, required: true },
  image:       { type: String }, // base64 string
});

const Item = mongoose.model("Item", itemSchema);

const joiSchema = Joi.object({
  title:       Joi.string().min(2).max(100).required(),
  category:    Joi.string().min(2).max(50).required(),
  price:       Joi.number().min(0.01).max(9999).required(),
  description: Joi.string().min(5).max(500).required(),
  image:       Joi.string().allow("", null).optional(),
});

// GET all items
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// GET single item
app.get("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

// POST new item 
app.post("/api/items", upload.single("image"), async (req, res) => {
  const body = {
    title:       req.body.title,
    category:    req.body.category,
    price:       parseFloat(req.body.price),
    description: req.body.description,
    image:       req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
      : "",
  };

  const { error } = joiSchema.validate(body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const newItem = await Item.create(body);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to create item" });
  }
});

// UPDATE item 
app.put("/api/items/:id", upload.single("image"), async (req, res) => {
  const body = {
    title:       req.body.title,
    category:    req.body.category,
    price:       parseFloat(req.body.price),
    description: req.body.description,
    image:       req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
      : req.body.image || "",
  };

  const { error } = joiSchema.validate(body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const updated = await Item.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!updated) return res.status(404).json({ error: "Item not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update item" });
  }
});

// DELETE item
app.delete("/api/items/:id", async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Swiss server running on port ${PORT}`);
});