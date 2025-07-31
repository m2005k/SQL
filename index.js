const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");


app.use(methodOverride("_method")); // for PUT and DELETE requests
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: '$amriti@2005',
  });

let getRandomUser = () => {
    return [
      faker.string.uuid(),
      faker.internet.username(), 
      faker.internet.email(),
      faker.internet.password(),
    ];
}

INSERTING NEW DATA
let q = "INSERT INTO user (id, username, email, password) VALUES ?";

let data = [];
for (let i = 0; i < 100; i++) {
    data.push(getRandomUser()); // 100 fake users
}  

//HOME route
app.get("/", (req, res) => {
    let q = `SELECT count(*) FROM user`;
    try {
    connection.query(q, (err, result) => {
        if (err) throw err;
        let count = result[0]['count(*)'];
        res.render("home.ejs", {count});

    });
} catch (err) {
   console.error(err);
   res.send("some error in DB");
};
});

// show route
app.get("/user",(req,res)=>{
    let q = `SELECT * FROM user`;
    try {
        connection.query(q, (err, users) => {
            if (err) throw err;
            res.render("showusers.ejs",{ users })
    
        });
    } catch (err) {
       console.error(err);
       res.send("some error in DB");
    };
})

//Edit route
app.get("/user/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id = '${id}'`;
     try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            res.render("edit.ejs",{ user });
            });
        } catch (err) {
           console.error(err);
        };
});

//update(db)route
app.patch("/user/:id", (req, res) => {
    let { id } = req.params;
    let { password :formPass, username : newUsename} = req.body;
    let q = `SELECT * FROM user WHERE id = '${id}'`;
     try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            if (user.password !== formPass) {
                return res.send("Incorrect Password");
            } else{
                let q2 = `UPDATE user SET username = '${newUsename}' WHERE id = '${id}'`;
                connection.query(q2, (err, result) => {
                    if (err) throw err;
                    res.redirect("/user");
                });
            }
            });
        } catch (err) {
           console.error(err);
        };
});

app.get("/adduser", (req, res) => {
    res.render("adduser.ejs");
});
//POST route
app.post("/adduser", (req, res) => {
    let { username, email, password } = req.body;
    let id = uuidv4();
    let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}')`;
    try {
    connection.query(q, (err, result) => {
        if (err) throw err;
        console.log("added new user");
        res.redirect("/user");
    });
}   catch (err) {
      res.send("Some error occured");
}

});

app.get("/user/:id/delete", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;
  
    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        let user = result[0];
        res.render("delete.ejs", { user });
      });
    } catch (err) {
      res.send("some error with DB");
    }
  });

app.delete("/user/:id/", (req, res) => {
    let { id } = req.params;
    let { password } = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;
  
    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        let user = result[0];
  
        if (user.password != password) {
          res.send("WRONG Password entered!");
        } else {
          let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
          connection.query(q2, (err, result) => {
            if (err) throw err;
            else {
              console.log(result);
              console.log("deleted!");
              res.redirect("/user");
            }
          });
        }
      });
    } catch (err) {
      res.send("some error with DB");
    }
  });

app.listen("8080", () => {
    console.log("Server is listening to port 8080");
});
