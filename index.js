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

const uri = `mongodb+srv://${process.env.DB_user}:${process.env.Db_pass}@cluster0.tvtcgta.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const blogCollection = client.db("proseParadiseDB").collection("blog");
    const wishListCollection = client
      .db("proseParadiseDB")
      .collection("wishList");

    // ----------------------------------------------------------------
    // --------------------blog related route---------------------------
    // ----------------------------------------------------------------

    app.get("/blog", async (req, res) => {
      const cursor = blogCollection.find();
      const result = await cursor.toArray();
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

    // ----------------------------------------------------------------
    // --------------------wish list related route---------------------------
    // ----------------------------------------------------------------

    app.post("/wishList", async (req, res) => {
      const addNewBlog = req.body;
      //   console.log(addNewBlog);
      const result = await wishListCollection.insertOne(addNewBlog);
      res.send(result);
    });

    app.get("/wishList", async (req, res) => {
      const cursor = wishListCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/wishList/:email", async (req, res) => {
      // console.log(req.params.email);
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
  res.send("seeeeeeeeerver is running");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
