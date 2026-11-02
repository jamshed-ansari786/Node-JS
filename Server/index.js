// /* HTTP Server -> HTTP Server ek program hota hai jo browser ya client se request receive karta hai aur uske according response send karta hai 

//                Action                              HTTP Method
//          Users ka data dekhna                          GET
//          Naya user create karna                        POST
//          User ka data update karna                   PUT / PATCH
//          User ko delete karna                          DELETE

// */

// // const fs = require("fs");
// // const url = require("url");
// const http = require("http");
// const express = require("express");

// const app = express();

// app.get("/", (req, res) => {
//     return res.send("Hello From Home Page");
// });

// app.get("/about", (req, res) => {
//     console.log("About Routed Called")
//     return res.send("Hello From About Page" + " hey " + req.query.name + " you are " + req.query.age);
// });
// app.get("/contacts", (req, res) => {
//     console.log("Contacts Route Called ")
//     return res.send("9931414984");
// });

// const myServer = http.createServer(app);

// myServer.listen(8000, () => console.log("Server Started!"));


// // function myHandler(req, res) {
// //     if (req.url === "/favicon.ico") return res.end();
// //     const log = `${Date.now()}: ${req.method} ${req.url} New Req Received\n`;
// //     const myUrl = url.parse(req.url, true);

// //     fs.appendFile("log.txt", log, (err, data) => {
// //         switch (myUrl.pathname) {
// //             case "/":
// //                 if (req.method === "GET") res.end("Homepage");
// //                 break;

// //             case "/about":
// //                 const username = myUrl.query.myname;
// //                 res.end(`Hi, ${username}`);
// //                 break;

// //             case "/search":
// //                 res.end("Search Results");
// //                 break;

// //             case "/signup":
// //                 if (req.method === "GET") res.end("This is a signup form");
// //                 else if (req.method === "POST") {
// //                     // DB Query
// //                     res.end("Success");
// //                 }
// //                 break;

// //             default:
// //                 res.statusCode = 404;
// //                 res.end("404 Not Found");
// //                 break;
// //         }

// //     });

// // };






const express = require("express");

const app = express();

app.get("/", (req, res) => {
    return res.send("Hello From Home Page");
});

app.get("/about", (req, res) => {
    return res.send(`Hello ${req.query.name} ${req.query.age}`);
});

app.listen(8001, () => console.log("Server Started!"));