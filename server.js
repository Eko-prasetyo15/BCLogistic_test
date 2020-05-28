const express = require("express");
const app = express();
const path = require("path");
const sqlite3 = require('sqlite3').verbose();
const fs = require("fs");
var bodyParser = require('body-parser');

const db_name = path.join(__dirname, "bclog.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'bclog.db'");
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())
app.use("/", express.static(path.join(__dirname, "views")));

app.get("/", (req, res) => {
  let result = [];
  let dataFilter = false;

  if (req.query.check_id && req.query.id) {
    result.push(`id = ${parseInt(req.query.id)}`);
    dataFilter = true;
  }
  if (req.query.check_name && req.query.searchName) {
    result.push(`name = '${req.query.searchName}'`);
    dataFilter = true;
  }
  if (req.query.check_addres && req.query.searchAddres) {
    result.push(`addres = '${req.query.searchAddres}'`)
    dataFilter = true;
  }
  if (req.query.check_number && req.query.searchNumber) {
    result.push(`number = '${req.query.searchNumber}'`);
    dataFilter = true;
  }
  
  let querySql = `SELECT COUNT (*) AS total FROM datauser`;
  if (dataFilter == true) {
    querySql = querySql + ` WHERE ${result.join(' AND ')}`;
  }
// let querySql = `SELECT * FROM datauser`;
  db.all(querySql, (err, count) => {
    if (err) throw err;
    const page = req.query.page || 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    const total = count[0].total;
    // console.log(count)
    // console.log(`ini total = ${total}`);

    const pages = Math.ceil(total / limit);
    // console.log(`ini pages = ${pages}`)

    let sql = `SELECT * FROM datauser`;
    if (dataFilter == true) {
      sql = sql + ` WHERE ${result.join(' AND ')}`
      console.log(sql)
    }
    sql = sql + ` LIMIT ${limit} OFFSET ${offset}`;
    // console.log(sql);

    db.all(sql, (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      res.render("index", {
        data: row,
        query: req.query,
        page,
        pages
      });
    });
  });
});

app.post('/', (req, res) => {
  const { name, addres, number} = req.body;
  let sql = `INSERT INTO datauser (name, addres, number)
              VALUES ('${name}', '${addres}', '${number}')`;
  db.run(sql, (err, ) => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/');
  });
});

app.post('/edit', (req, res) => {
  const { id, name, addres, number} = req.body;
  let sqleditData = `UPDATE datauser SET name = '${name}', addres = '${addres}', number = '${number}'
                    WHERE id = '${id}';`
  console.log(sqleditData);
  db.run(sqleditData, (err) => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/');
  });
})

app.post('/hapus', (req, res) => {
  const id = req.body.id;
  let sqlDelete = `DELETE FROM datauser WHERE id = ?`;
  db.run(sqlDelete, id, (err) => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect('/');
  });
});



app.listen(8000, () => {
  console.log("Port ini berjalan di localhost:8000");
});