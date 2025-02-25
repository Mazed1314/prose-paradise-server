const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://prose-paradise.web.app",
      "https://prose-paradise.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());

// connect with mongodb
const uri = `mongodb+srv://${process.env.DB_user}:${process.env.Db_pass}@cluster0.tvtcgta.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // ----------------------------------------------------------------
    // --------------------DB collection---------------------------
    // ----------------------------------------------------------------

    const blogCollection = client.db("proseParadiseDB").collection("blog");
    const commentCollection = client
      .db("proseParadiseDB")
      .collection("comment");
    const wishListCollection = client
      .db("proseParadiseDB")
      .collection("wishList");

    // ----------------------------------------------------------------
    // --------------------blog related route---------------------------
    // ----------------------------------------------------------------

    app.get("/blog", async (req, res) => {
      // const cursor = blogCollection.find();
      const result = await blogCollection.find().toArray();
      res.send(result);
    });

    app.get("/blog/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogCollection.findOne(query);
      res.send(result);
    });

    app.post("/addBlog", async (req, res) => {
      const addNewBlog = req.body;
      //   console.log(addNewBlog);
      const result = await blogCollection.insertOne(addNewBlog);
      res.send(result);
    });

    app.delete("/blog/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/blog/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedBlog = req.body;

      const blog = {
        $set: {
          title: updatedBlog.title,
          category: updatedBlog.category,
          short_description: updatedBlog.short_description,
          long_description: updatedBlog.long_description,
          image: updatedBlog.image,
          email: updatedBlog.email,
          user_name: updatedBlog.user_name,
        },
      };
      const result = await blogCollection.updateOne(filter, blog, options);
      res.send(result);
    });

    // ----------------------------------------------------------------
    // --------------------wish list related route---------------------------
    // ----------------------------------------------------------------

    app.post("/wishList", async (req, res) => {
      const addNewBlog = req.body;
      //   console.log(addNewBlog);
      const result = await wishListCollection.insertOne(addNewBlog);
      res.send(result);
    });

    app.get("/wishList/:email", async (req, res) => {
      const result = await wishListCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    app.get("/wishList/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await wishListCollection.findOne(query);
      res.send(result);
    });

    app.delete("/wishList/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await wishListCollection.deleteOne(query);
      res.send(result);
    });

    // -----------------------------------------------------------------------
    // --------------------my-blogs related route---------------------------
    // -----------------------------------------------------------------------

    app.get("/my-blog/:email", async (req, res) => {
      const result = await blogCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    // -----------------------------------------------------------------------
    // --------------------featured related route---------------------------
    // -----------------------------------------------------------------------

    app.get("/api/top-posts", async (req, res) => {
      const result = await blogCollection.find().toArray();
      result.sort((a, b) => {
        const lengthA = a.long_description ? a.long_description.length : 0;
        const lengthB = b.long_description ? b.long_description.length : 0;
        return lengthB - lengthA;
      });
      const topPosts = result.slice(0, 10);
      res.send(topPosts);
    });

    // -----------------------------------------------------------------------
    // --------------------pagination related route---------------------------
    // -----------------------------------------------------------------------

    app.get("/all-blog", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page) - 1;
      const filter = req.query.filter;
      const search = req.query.search;
      let query = {
        title: { $regex: search, $options: "i" },
      };
      if (filter) query.category = filter;
      const result = await blogCollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    // -----------------------------------------------------------------------
    // --------------------comment related route---------------------------
    // -----------------------------------------------------------------------

    app.post("/com", async (req, res) => {
      const comment = req.body;
      const result = await commentCollection.insertOne(comment);
      res.send(result);
    });

    app.get("/com/:blog_id", async (req, res) => {
      const result = await commentCollection
        .find({ blog_id: req.params.blog_id })
        .toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("ProseParadise is running");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
