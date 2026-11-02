/*

Node.js mein module ek separate file ya code unit hota hai jisme hum related functions, variables ya logic rakhte hain. Is code ko hum dusri file mein import karke reuse kar sakte hain

*/

// function sub(a, b) {
//     return a - b;
// }

function add(a, b) {
    return a + b;
}


// console.log(add(1,2));

// module.exports = {
//     add,
//     sub,
// };

exports.add = (a, b) => a + b;
exports.sub = (a, b) => a - b;