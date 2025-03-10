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
      origin: [
         "http://localhost:5173", 
         "http://localhost:5174", 
         "https://assignment-11-26be9.web.app",
         "https://assignment-11-26be9.firebaseapp.com",
      ],
      credentials: true,
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

const verifyToken = async (req, res, next) => {
   const token = req?.cookies?.token;
   console.log("token tooook", token);
   if (!token) {
      return res.status(401).send({ message: "not authorized" });
   }
   jwt.verify(token, process.env.SECRET_KEY_TOKEN, (err, decoded) => {
      if (err) {
         console.log(err);
         return res.status(401).send({ message: "unauthorized" });
      }
      console.log("value in the token", decoded);
      req.user = decoded;
      next();
   });
};

const cookieOption = {
   httpOnly: true,
   sameSite: process.env.NODE_ENV === 'production'? 'none': 'strict',
   secure: process.env.NODE_ENV === 'production'? true: false,
};
async function run() {
   try {
      // Connect the client to the server	(optional starting in v4.7)
      // await client.connect();

      // Send a ping to confirm a successful connection
      const roomCollection = client.db("Hotel").collection("rooms");
      const bookingCollection = client.db("Hotel").collection("booking");
      const reviewCollection = client.db("Hotel").collection("reviews");

      app.post("/jwt", async (req, res) => {
         const user = req.body;
         const token = jwt.sign(user, process.env.SECRET_KEY_TOKEN, { expiresIn: "1h" });
         res.cookie("token", token, cookieOption).send({ success: true });
      });

      app.get("/rooms", async (req, res) => {
         const courser = roomCollection.find();
         const result = await courser.toArray();
         res.send(result);
      });
      app.get("/roomSort", async (req, res) => {
         const query = { price_per_night: { $gt: 120 } };

         // const result =  courser
         const options = {
            sort: { title: 1, price_per_night: 0 },

            projection: { title: 1 },
         };
         const result = await roomCollection.find(query, options).toArray();
         // console.log(query);
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

      app.get("/bookings", verifyToken, async (req, res) => {
         let query = {};
         // console.log('token',req.cookies.token)
         console.log("value in the token", req.user);
         if (req.query.email !== req.user.email) {
            return res.status(403).send({ message: "forbidden access" });
         }

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

      app.get("/bookings/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const result = await bookingCollection.findOne(query);
         res.send(result);
      });

      app.put("/bookings/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const options = { upsert: true };
         const updateBooking = req.body;
         console.log(updateBooking);
         const updateDoc = {
            $set: {
               date: updateBooking.date,
               guest: updateBooking.guest,
            },
         };
         const result = await bookingCollection.updateOne(query, updateDoc, options);
         res.send(result);
      });

      app.post("/reviews", async (req, res) => {
         const courser = req.body;
         const result = await reviewCollection.insertOne(courser);
         res.send(result);
      });
      app.get("/reviews", async (req, res) => {
         const result = await reviewCollection.find().toArray();
         res.send(result);
      });

      // await client.db("admin").command({ ping: 1 });
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
