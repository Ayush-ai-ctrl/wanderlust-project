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

require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const ATLAS_URL = process.env.ATLASDB_URL;

async function autoAssignOwner() {
  try {
    await mongoose.connect(ATLAS_URL);
    console.log("Connected to Live Atlas DB");

    // 1. Live database se pehla user automatic nikalein
    const existingUser = await User.findOne({});

    if (!existingUser) {
      console.log("Live database mein koi user nahi mila! Pehle apni Render website par Sign Up karein.");
      await mongoose.disconnect();
      return;
    }

    console.log(`User mil gaya: ${existingUser.username} (ID: ${existingUser._id})`);

    // 2. Bina coordinates chhede sabhi listings ka owner update karein
    const result = await Listing.updateMany(
      {},
      { $set: { owner: existingUser._id } }
    );

    console.log(`Success! ${result.modifiedCount} listings ab "${existingUser.username}" ke naam ho gayi hain.`);
    await mongoose.disconnect();
  } catch (err) {
    console.log("Error:", err);
  }
}

autoAssignOwner();
