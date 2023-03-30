const express = require("express");
const cors = require("cors");
var jwt = require("jsonwebtoken");
const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  ConnectionClosedEvent,
} = require("mongodb");
const query = require("express/lib/middleware/query");
require("dotenv").config();

const port = process.env.PORT || 5000;

const app = express();
const stripe = require("stripe")(
  "sk_test_51LVKw8GSGClrvX9q7T97oJnASQEho0USM91MWBTKyIQj8sJMyqBUTjtzwvHZxgI5UQThfQ365RaTYwsHBJb9c17L00ilwp1Ynb"
);

//homeify
//S7LWJAfdHcg_Qup

// middleware
app.use(cors());
app.use(express.json());
//ycxtPXJJ7KqqWBFP
//homeify
const uri =
  "mongodb+srv://homeify:ycxtPXJJ7KqqWBFP@cluster0.8lf54jt.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
//console.log(client);

async function run() {
  try {
    const allProduct = client.db("Homeify").collection("Products");
    const productdetails = client.db("Homeify").collection("Products");
    const cart = client.db("Homeify").collection("Cart");
    const report = client.db("Homeify").collection("Reports");
    const user = client.db("Homeify").collection("User");
    const payment = client.db("Homeify").collection("Payment");

    function jwtVerify(req, res, next) {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        res.status(401).send({ message: "Unauthorized" });
      }
      // verify a token symmetric
      jwt.verify(token, "SECRET", function (err, decoded) {
        if (err) {
          res.status(401).send({ message: "Unauthorized" });
        }
        req.decoded = decoded;
        next();
      });
      // console.log(token);
    }
    //New
    app.get("/allProduct", async (req, res) => {
      const query = {};
      const category = await allProduct.find(query).toArray();
      res.send(category);
    });
    app.get("/singleservice/:id", async (req, res) => {
      // const singleservice = userCollection.collection("serviceDetails");
      const id = req.params.id;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const user = await allProduct.findOne(query);
      //console.log(user);
      res.send(user);
    });

    app.post("/saveuser", async (req, res) => {
      const data = req.body;
      // console.log(data.email);
      const query = { email: data.email };
      const update = { $set: data };
      const options = { upsert: true };
      const result = await user.updateOne(query, update, options);

      // const result = await user.insertOne(data);
      res.send(result);
    });

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, "SECRET", { expiresIn: 18000 });
      // console.log(token);
      res.send({ token });
    });

    app.post("/addtocart", async (req, res) => {
      const data = req.body;
      // console.log(data);
      const result = await cart.insertOne(data);
      res.send(result);
    });
    app.get("/fetchcart/:id", async (req, res) => {
      //fetch product
      const id = req.params.id;
      // console.log(id);
      const query = { uid: id };
      const product = await cart.find(query).toArray();
      // console.log(product);
      res.send(product);
    });
    app.get("/deletecartproduct/:id", async (req, res) => {
      const id = req.params.id;
      //console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await cart.deleteOne(query);
      res.send(result);
    });

    app.get("/sellerproduct/:id", async (req, res) => {
      const email = req.params.id;

      const query = { seller: email };
      //console.log(query);
      const result = await allProduct.find(query).toArray();
      res.send(result);
    });
    app.get("/sadvertise/:id", async (req, res) => {
      const id = req.params.id;
      //console.log("sadvertise", id);
      const query = { _id: ObjectId(id) };
      const update = { $set: { advertised: "Yes" } };
      const options = { upsert: true };
      const result = await allProduct.updateOne(query, update, options);
      res.send(result);
    });

    app.post("/addproduct", async (req, res) => {
      const data = req.body;
      //console.log(data);
      const result = await allProduct.insertOne(data);
      res.send(result);
    });
    app.get("/fetchuser", async (req, res) => {
      const query = {};
      const category = await user.find(query).toArray();
      res.send(category);
    });

    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { uid: id };
      const usr = await user.findOne(query);
      res.send(usr);
    });
    app.get("/deleteuser/:id", async (req, res) => {
      const id = req.params.id;
      //console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await user.deleteOne(query);
      res.send(result);
    });
    app.post("/savereport", async (req, res) => {
      const data = req.body;
      // console.log(data);
      const result = await report.insertOne(data);
      res.send(result);
    });

    app.get("/report", async (req, res) => {
      const query = {};
      const category = await report.find(query).toArray();
      res.send(category);
    });
    app.get("/deletereport/:id", async (req, res) => {
      const id = req.params.id;
      //console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await report.deleteOne(query);
      res.send(result);
    });

    app.post("/create-payment-intent", async (req, res) => {
      const booking = req.body;
      const price = booking.total;
      const amount = price * 100;
      // console.log(amount);
      //console.log(price);
      if (price === undefined) {
        return;
      }
      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });
    app.post("/payment", async (req, res) => {
      const info = req.body;
      //console.log(info);
      const query = {
        email: info.email,
        total: info.total,
        location: info.location,
        status: info.status,
      };
      const update = { $set: info };
      const options = { upsert: true };
      const result = await payment.updateOne(query, update, options);
      res.send(result);
    });
    app.get("/payment/:id", async (req, res) => {
      //fetch product
      const email = req.params.id;
      // console.log(id);
      const query = { email: email };
      const product = await payment.find(query).toArray();
      // console.log(product);
      res.send(product);
    });
    app.get("/cartdelete", async (req, res) => {
      //  console.log("hi");
      const query = {};
      const product = await cart.deleteMany(query);
      // console.log(product);
      res.send(product);
    });
    app.get("/deletedashboardproduct/:id", async (req, res) => {
      const id = req.params.id;
      //console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await payment.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("homeify server is running");
});

//others stripe method
// app.post("/paymentstripe", async (req, res) => {
//   let status, error;

//   const { token, amount } = req.body;
//   console.log(token.id, amount);
//   try {
//     await stripe.charges.create({
//       source: token.id,
//       amount,
//       currency: "usd",
//     });
//     status = "success";
//   } catch (err) {
//     console.log(err);
//     status = "200";
//   }
//   res.send(status);
// });

app.listen(port, () => console.log(`homeify running on ${port}`));
