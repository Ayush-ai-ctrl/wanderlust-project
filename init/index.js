// Downloaded By Apna Collage Batch

// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing = require("../models/listing.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// main()
//   .then(() => {
//     console.log("connected to DB");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// async function main() {
//   await mongoose.connect(MONGO_URL);
// }

// const initDB = async () => {
//   await Listing.deleteMany({});
//   await Listing.insertMany(initData.data);
//   console.log("data was initialized");
// };

// initDB();


// Write By Himself

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require ("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main().then((req, res) => {
   console.log("connected to DB");
}).catch((err) => {
   console.log(err);
});

async function main() {
   await mongoose.connect(MONGO_URL);
};

const initDB = async () => {
   await Listing.deleteMany({});
   initData.data = initData.data.map((obj) => ({...obj, owner: '6adc935fce756868225aa4a0'}));
   await Listing.insertMany(initData.data);
   console.log("data was initialized");
};

initDB();