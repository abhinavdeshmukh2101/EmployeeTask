const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
app.use(cors());

/*****************************************/
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});
/*****************************************/

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

const dbName = "Employees";
client.connect();
const db = client.db(dbName);

// console.log(uuidv4());

//get all available employess
app.get("/api/emp", async (req, res) => {
  // Use connect method to connect to the server
  const collection = db.collection("emp");

  var findResult = await collection.find({}).toArray();
  // console.log(findResult);
  res.send(findResult);
});

//getting indivisual employee data.
app.get("/api/emp/:id", async (req, res) => {
  const id = req.params.id;
  // Use connect method to connect to the server
  const collection = db.collection("emp");

  var findResult = await collection.findOne({ empID: id });
  // console.log(findResult);
  res.send(findResult);
});

app.post("/api/emp", async (req, res) => {
  // console.log(req.body);

  var ID = req.body.id.replace(/\s+/g, "").slice(0, 6);

  var obj = {
    empID: ID,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    emailId: req.body.emailId,
  };

  console.log(obj);

  const collection = db.collection("emp");

  if ((await collection.findOne({ emailId: obj.emailId })) != undefined) {
    res.send("Employee already exists");
    res.end();
  } else if ((await collection.findOne({ empID: ID })) != undefined) {
    res.send("Please try again");
    res.end();
  }

  await collection.insertOne(obj);
  res.send("Employee inserted successfully!!!");
  // console.log(obj);
});

app.patch("/api/emp/:id", async (req, res) => {
  const dataa = req.body;
  console.log(dataa);

  const collection = db.collection("emp");

  collection
    .updateOne(
      { empID: req.params.id },
      {
        $set: {
          firstName: dataa.firstName,
          lastName: dataa.lastName,
          emailId: dataa.emailId,
        },
      }
    )
    .then((ress) => {
      res.send("updated successfully");
    });
});

//delete a given employee
app.delete("/api/emp/:id", async (req, res) => {
  const Id = req.params.id;
  console.log(Id);

  // Use connect method to connect to the server
  await db.collection("emp").deleteOne({ empID: Id });

  res.send("Employee with employee ID" + Id + " is deleted successfully!!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
