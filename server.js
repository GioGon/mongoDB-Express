const express = require("express");
const { connectToDb, getDb } = require("./mongo");
const { ObjectId } = require("mongodb");
const app = express();

app.use(express.json());

let db;

connectToDb((error) => {
  if (!error) {
    app.listen(8080, () => console.log("Hello, I'm the server :)"));
    db = getDb();
  }
});

app.get("/books", (req, res) => {
  db.collection("books")
    .find()
    .toArray()
    .then((resp) => {
      res.status(200).json(resp);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: `Could not fetch books with error: ${error}` });
    });
});

app.get("/book/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    // here we have to check if the BSONType is valid
    db.collection("books")
      .findOne({ _id: new ObjectId(req.params.id) })
      // remember to require ObjectId from mongodb
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((error) => {
        res.status(500).error({
          error: `Could not fetch book id: ${req.params.id} with error: ${error}`,
        });
      });
  }
});

app.post("/newBook", (req, res) => {
  // Body:
  //   {
  //     "author": "Fyodor Dostoevsky",
  //     "pages": 551,
  //     "title": "Crime and Punishment",
  //     "rates": 8
  //   }
  const body = req.body;

  db.collection("books")
    .insertOne(body)
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: `Could not create a new book with error: ${error}` });
    });
});
