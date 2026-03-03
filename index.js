import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
const port = 4000;


mongoose.connect("mongodb://127.0.0.1:27017/blogDB");


const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  date: { type: Date, default: Date.now },
});


postSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

postSchema.set("toJSON", { virtuals: true });

const Post = mongoose.model("Post", postSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});


app.get("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: "Invalid ID format" });
  }
});


app.post("/posts", async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(400).json({ message: "Error creating post" });
  }
});


app.patch("/posts/:id", async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedPost) return res.status(404).json({ message: "Post not found" });
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ message: "Error updating post" });
  }
});

app.delete("/posts/:id", async (req, res) => {
  try {
    const result = await Post.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(400).json({ message: "Error deleting post" });
  }
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});