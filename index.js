
let express = require('express');
let app = express();
let bodyParser = require('body-parser')
let http = require('http').Server(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.engine("pug", require("pug").__express);
app.set("views", ".");
app.set("view engine", "pug");


const MongoClient = require('mongodb').MongoClient;
const mongo_username = 'new_user_31';
const mongo_password = '4jMd8PvTdkcvS23A';

const uri = `mongodb+srv://${mongo_username}:${mongo_password}@cluster0.vgrgm74.mongodb.net/crmdb?retryWrites=true&w=majority&appName=Cluster0`;

let client; // Define client globally
console.log("outside the connect function");

/*MongoClient.connect(uri, (err, db) => {
  console.log("in the connect function");
  if (err) {
    console.error(err);
    return;
  }
  client = db;
  console.log("Connected to MongoDB successfully");
});
*/

MongoClient.connect(uri)
.then(client =>{
  console.log("connected to mongodb");

   
  
  app.get("/", function(req, res) {
    res.sendFile("/index.html", { root: "." })
  });

  app.get("/create", function(req, res) {
    res.sendFile("/create.html", { root: "." })
  });

  app.post("/create", function(req, res, next) {
     const customers = client.db("crmdb").collection("customers");

      let customer = {
        name: req.body.name,
        address: req.body.address,
        telephone: req.body.telephone,
        note: req.body.note,
      };
      customers.insertOne(customer, function(err, res) {
        if (err) throw err;
        console.log("1 customer inserted");
      });

    res.send('Customer created');
  });

  app.get("/get", function(req, res) {
    res.sendFile("/get.html", { root : "."});
  });

  app.get("/get-client", function(req, res) {
    const customers = client.db("crmdb").collection("customers");

    console.log("in the get-client function");
    console.log(req.query.name);
    customers.findOne({ name: req.query.name }, function(err, result) {
      if (err) {
        console.error("Error finding customer:", err);
        res.status(500).send('Error finding customer');
        return;
      }
      if (!result) {
        console.log("Customer not found");
        res.status(404).send('Customer not found');
        return;
      }
      console.log("Customer found:", result);
      res.render("update", {
        oldname: result.name,
        oldaddress: result.address,
        oldtelephone: result.telephone,
        oldnote: result.note,
        name: result.name,
        address: result.address,
        telephone: result.telephone,
        note: result.note,
      });
    });

    
  });


  app.set("port", process.env.PORT || 5000)
  http.listen(app.get("port"), function() {
    console.log("listening on port", app.get("port"))
  });


  
}).catch(err => {
  console.log(err)
});

console.log("End");



