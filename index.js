const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(
   cors({
      origin: ["http://localhost:5173"],
      witCredentials: true,
   })
);
app.use(express.json());
app.use(cookieParser());

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

      app.post("/jwt", async (req, res) => {
         const user = req.body;
         console.log(user);
         const token = jwt.sign(user, process.env.SECRET_KEY_TOKEN, { expiresIn: "1h" });
         res
         .cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "none",
         }).send({ success: true });
      });
      // Send a ping to confirm a successful connection
      const roomCollection = client.db("Hotel").collection("rooms");
      const bookingCollection = client.db("Hotel").collection("booking");

      app.get("/rooms", async (req, res) => {
         const courser = roomCollection.find();
         const result = await courser.toArray();
         res.send(result);
      });

      app.get("/room/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const result = await roomCollection.findOne(query);
         res.send(result);
      });

      app.post("/bookings", async (req, res) => {
         const courser = req.body;
         const result = await bookingCollection.insertOne(courser);
         res.send(result);
      });

      app.get("/bookings", async (req, res) => {
         let query = {};
         console.log('token',req.cookies.token)

         if (req.query?.email) {
            query = { email: req.query.email };
         }

         const result = await bookingCollection.find(query).toArray();
         res.send(result);
      });

      app.delete("/bookings/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const result = await bookingCollection.deleteOne(query);
         res.send(result);
      });

      app.put("/bookings/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const updateBooking = req.body;
         const updateDoc = {
            $set: {
               date: updateBooking.date,
               guest: updateBooking.guest,
            },
         };
         const result = await bookingCollection.updateOne(query, updateDoc);
         res.send(result)
      });

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
