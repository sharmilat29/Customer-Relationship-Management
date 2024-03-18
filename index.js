let express = require('express');
let bodyParser = require('body-parser');
let http = require('http');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.engine("pug", require("pug").__express);
app.set("views", ".");
app.set("view engine", "pug");

const mongo_username = process.env.MONGO_USERNAME;
const mongo_password = process.env.MONGO_PASSWORD;
const uri = `mongodb+srv://${mongo_username}:${mongo_password}@cluster0.vgrgm74.mongodb.net/crmdb`;

MongoClient.connect(uri)
  .then(client => {
    console.log("Connected to MongoDB");

    const db = client.db("crmdb");
    const customers = db.collection("customers");

    app.get("/", (req, res) => {
      res.sendFile("/index.html", { root: "." });
    });

    app.get("/create", (req, res) => {
      res.sendFile("/create.html", { root: "." });
    });

    app.post("/create", (req, res) => {
      let customer = {
        name: req.body.name,
        address: req.body.address,
        telephone: req.body.telephone,
        note: req.body.note
      };

      customers.insertOne(customer)
        .then(() => {
          console.log("Customer inserted");
          res.send('Customer created');
        })
        .catch(err => {
          console.error("Error inserting customer:", err);
          res.status(500).send('Error creating customer');
        });
    });

    app.get("/get", (req, res) => {
      res.sendFile("/get.html", { root : "." });
    });

    app.get("/get-client", (req, res) => {
      const name = req.query.name;
      customers.findOne({ name })
        .then(result => {
          if (!result) {
            console.log("Customer not found");
            res.status(404).send('Customer not found');
          } else {
            console.log("Customer found:", result);
            res.render("update", {
              oldname: result.name,
              oldaddress: result.address,
              oldtelephone: result.telephone,
              oldnote: result.note,
              name: result.name,
              address: result.address,
              telephone: result.telephone,
              note: result.note
            });
          }
        })
        .catch(err => {
          console.error("Error finding customer:", err);
          res.status(500).send('Error finding customer');
        });
    });

    app.post("/update-client", function(req, res) {
      const oldname = req.body.oldname;
      const oldaddress = req.body.oldaddress;
      const oldtelephone = req.body.oldtelephone;
      const oldnote = req.body.oldnote;

      const query = {
        name: oldname,
        address: oldaddress,
        telephone: oldtelephone,
        note: oldnote
      };

      const newValues = {
        $set: {
          name: req.body.name,
          address: req.body.address,
          telephone: req.body.telephone,
          note: req.body.note
        }
      };

      customers.updateOne(query, newValues)
        .then(result => {
          console.log("Customer updated");
          res.redirect("/?success=Update%20successful");
        })
        .catch(err => {
          console.error("Error updating customer:", err);
          res.status(500).send("Error updating customer");
        });
    });


    app.post("/delete-client", function(req, res) {
      console.log(req.body.oldname);
      let query = {
        name : req.body.oldname,
        address: req.body.oldaddress ? req.body.oldaddress : null,
        telephone: req.body.oldtelephone ? req.body.oldtelephone : null,
        note: req.body.oldnote ? req.body.oldnote : null,
      };
      customers.deleteOne(query)
      .then(result => {
        console.log("Customer deleted successfully", result);
        res.redirect("/?success=Delete%20successful");
      })
      .catch(err => {
        console.error("Error deleting customer:", err);
        res.status(500).send("Error deleting customer");
      });
    });

    http.createServer(app).listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err);
  });
