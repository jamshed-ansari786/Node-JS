/*

File handling is the process of creating, reading, writing, updating, and deleting files using a programming language

*/

// const fs = require("fs");

//Sync... Blocking
// fs.writeFileSync("./test.txt", "Hello World");

// Async.. Non - Blocking Req
// fs.writeFile("./test.txt", "Hello World Async", (err) => { });

// const result = fs.readFileSync("./contacts.txt", "utf-8");
// console.log(result);

fs.readFile("./contacts.txt", "utf-8", (err, result) => {
    if (err) {
        console.log("Error", err);
    } else {
        console.log(result);
    }
});


// fs.appendFileSync("./test.txt", new Date().getDate().toLocaleString());

// fs.appendFileSync("./test.txt",` ${Date.now()} Hey There\n`);

// fs.cpSync("./test.txt","./copy.txt");

// fs.unlinkSync("./copy.txt");

// console.log(fs.statSync("./test.txt").isFile());

// fs.mkdirSync("my-docss/a/b", {recursive: true});

const fs = require("fs");

// console.log("1");
// // Blocking...
// const result = fs.readFileSync("contacts.txt", "utf-8");
// console.log(result);

// console.log("2");

console.log("1");
// Non - Blocking..

