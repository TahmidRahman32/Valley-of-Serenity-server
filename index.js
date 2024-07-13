const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.SECRET_KEY_USER}:${process.env.SECRET_KEY_PASS}@cluster0.gv1gxa1.mongodb.net/?appName=Cluster0`;

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
      await client.connect();
      // Send a ping to confirm a successful connection
      const roomCollection = client.db("Hotel").collection("rooms");

      app.get('/rooms',async(req, res)=>{
         const courser = roomCollection.find();
         const result = await courser.toArray();
         res.send(result)
      })

      app.get('/room/:id',async(req, res)=>{
         const id = req.params.id;
         const query = {_id: new ObjectId(id)}
         const result = await roomCollection.findOne(query);
         res.send(result)
      })

      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
   } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
   }
}
run().catch(console.dir);

app.get("/", (req, res) => {
   res.send("assignment 11 server running");
});

app.listen(port, () => {
   console.log(`assignment server running || ${port}`);
});
