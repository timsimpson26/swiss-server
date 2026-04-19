const express = require("express");
const cors = require("cors");
const path = require("path");
const Joi = require("joi");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let items = [
  { _id: 1, title: "Matterhorn Poster", category: "Poster", price: 19.99, description: "A stunning high-resolution poster of the iconic Matterhorn." },
  { _id: 2, title: "Swiss Chocolate Gift Box", category: "Food", price: 14.50, description: "Assorted premium Swiss chocolates from local chocolatiers." },
  { _id: 3, title: "Lucerne Landscape Print", category: "Print", price: 12.00, description: "A beautiful print of Lake Lucerne at sunrise." },
  { _id: 4, title: "Alpine Hiking Map", category: "Map", price: 8.75, description: "Detailed hiking map of Switzerland's most scenic alpine routes." },
  { _id: 5, title: "Mini Swiss Cuckoo Clock", category: "Souvenir", price: 24.99, description: "Traditional handcrafted mini cuckoo clock." },
  { _id: 6, title: "Swiss Travel Guide", category: "Guide", price: 9.99, description: "Complete travel guide for exploring Switzerland." },
  { _id: 7, title: "Interlaken Adventure Booklet", category: "Booklet", price: 5.99, description: "Discover adventure activities in Interlaken." },
  { _id: 8, title: "Swiss Flag Souvenir", category: "Souvenir", price: 6.50, description: "Classic Swiss flag keepsake souvenir." },
];

const itemSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  category: Joi.string().min(2).max(50).required(),
  price: Joi.number().min(0.01).max(9999).required(),
  description: Joi.string().min(5).max(500).required(),
});

// GET all items
app.get("/api/items", (req, res) => {
  res.json(items);
});

// GET single item
app.get("/api/items/:id", (req, res) => {
  const item = items.find((i) => i._id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
});

// POST new item
app.post("/api/items", (req, res) => {
  const { error } = itemSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const newItem = {
    _id: items.length > 0 ? Math.max(...items.map((i) => i._id)) + 1 : 1,
    title: req.body.title,
    category: req.body.category,
    price: parseFloat(req.body.price),
    description: req.body.description,
  };

  items.push(newItem);
  res.status(201).json(newItem);
});

// PUT update item
app.put("/api/items/:id", (req, res) => {
  const item = items.find((i) => i._id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: "Item not found" });

  const { error } = itemSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  item.title = req.body.title;
  item.category = req.body.category;
  item.price = parseFloat(req.body.price);
  item.description = req.body.description;

  res.json(item);
});

// DELETE item
app.delete("/api/items/:id", (req, res) => {
  const index = items.findIndex((i) => i._id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Item not found" });

  items.splice(index, 1);
  res.json({ message: "Item deleted successfully" });
});

// Fallback
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Swiss server running on port ${PORT}`);
});