require("dotenv").config();
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  category:    { type: String, required: true },
  price:       { type: Number, required: true },
  description: { type: String, required: true },
  image:       { type: String },
});

const Item = mongoose.model("Item", itemSchema);

const items = [
  { title: "Matterhorn Poster", category: "Poster", price: 19.99, description: "A stunning high-resolution poster of the iconic Matterhorn.", image: "" },
  { title: "Swiss Chocolate Gift Box", category: "Food", price: 14.50, description: "Assorted premium Swiss chocolates from local chocolatiers.", image: "" },
  { title: "Lucerne Landscape Print", category: "Print", price: 12.00, description: "A beautiful print of Lake Lucerne at sunrise.", image: "" },
  { title: "Alpine Hiking Map", category: "Map", price: 8.75, description: "Detailed hiking map of Switzerland's most scenic alpine routes.", image: "" },
  { title: "Mini Swiss Cuckoo Clock", category: "Souvenir", price: 24.99, description: "Traditional handcrafted mini cuckoo clock.", image: "" },
  { title: "Swiss Travel Guide", category: "Guide", price: 9.99, description: "Complete travel guide for exploring Switzerland.", image: "" },
  { title: "Interlaken Adventure Booklet", category: "Booklet", price: 5.99, description: "Discover adventure activities in Interlaken.", image: "" },
  { title: "Swiss Flag Souvenir", category: "Souvenir", price: 6.50, description: "Classic Swiss flag keepsake souvenir.", image: "" },
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Connected to MongoDB");
  await Item.deleteMany({});
  await Item.insertMany(items);
  console.log("Items seeded successfully!");
  mongoose.connection.close();
}).catch((err) => {
  console.error("Error:", err);
});