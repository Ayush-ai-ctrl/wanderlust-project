// both line are requireing for env file
if(process.env.NODE_ENV != "production"){
    require("dotenv").config(); 
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing =require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); // EJS templates ke andar meta tags manage karne ka option deta hai.
const warpAsync = require("./utils/warpAsync.js"); // for error handling in async function
const ExpressError = require("./utils/ExpressError.js"); // for custom error handling
const session = require("express-session"); // for require express-session
const MongoStore = require("connect-mongo").default; // for require connect-mongo store
const flash = require("connect-flash"); // for require connect-flash
const passport = require("passport");  
const LocalStrategy = require("passport-local");
const User = require("./models/user.js"); // for require user.js in model  

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const DB_URL = process.env.ATLASDB_URL;


main()
 .then( () => {
    console.log("Connected to DB");
 })
 .catch((err) => {
    console.log(err); 
 });
async function main () {
    await mongoose.connect(DB_URL),{}
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true})); // experss me form ke andar se url ko nikalne ke liye
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate); //  ejs meta ko use karne ke liye 
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: DB_URL,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24*3600,
});
store.on("error",() =>{
    console.log("Error in Mongo session Store", err);
});

const sessionOptions = {
     store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie: {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000 ,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    },
};

app.get("/", (req, res) => {
    res.redirect("/listings");
});




app.use(session(sessionOptions));
app.use(flash());
 
/* Passport Local Mangoose */
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currUser = req.user;
    res.locals.ayushcode = req.flash("ayushcode");
    res.locals.error = req.flash("error");
    next();
});

// Demo User (For cheaking )
// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "Delta 7.0",
//     });
//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });


app.use("/listings", listingRouter); // we are use this line for required listing.js for web pages
app.use("/listings/:id/reviews",reviewRouter); // we are use this line for required reviews.js for web pages
app.use("/",userRouter);


app.listen(8080, () => {
    console.log("Server in listening to port 8080");
});


// Update Route for save your data after editing
app.put("/listings/:id", warpAsync (async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;
    listing.price = req.body.listing.price;
    listing.image.url = req.body.listing.image;   // sirf url update, poora object nahi &  agar new image ko update karna hai to use copy image address link karne karo 

    await listing.save();
    res.redirect(`/listings/${id}`);
}));

app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
})

// Define a middleware function to Custom error handling 
app.use((err, req, res, next) => {
    let{statusCode = 500, message = "Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", { err});
    //res.status(statusCode).send(message);
})

// Un used code ---------------------------------------------------------------------------------- 

// After ExpressError-------------------------------------------
//const Review =require("./models/review.js");
// const { listingSchema, reviewSchema } = require("./schema.js"); // for validation of data using Joi
// const review = require("./models/review.js");

// For Reviews validation
// const validateReview = (req, res, next) => {
//     let {error} = reviewSchema.validate(req.body);  
//         if(error) {
//     throw new ExpressError(400, error.details.map(e => e.message).join(", "));
//     }else{
//         next();
//     }
// }

// // Index Route
// app.get("/listings", warpAsync (async (req, res) => {
//     const allListings  = await Listing.find({});
//     res.render("listings/index", {allListings});
// }));

// //  New Route For create new Listing form
// app.get("/listings/new", (req, res) => {
//     res.render("listings/new.ejs");
// });

// // Show Route
// app.get("/listings/:id", warpAsync (async (req, res) => {
//     let {id} = req.params;
//     const listing = await Listing.findById(id).populate("reviews");
//     res.render("listings/show.ejs", { listing });
// }));

// // Create Route for use save to new.ejs form in DB
// // app.post("/listings",async (req, res) => {
// //     const newListing = new Listing(req.body.listing);
// //     await newListing.save();
// //     res.redirect("/listings");
// // });

// app.post("/listings", validateListing, warpAsync (async(req, res, next) => {
//     // console.log("REQ.BODY:", req.body);
//     // console.log("TITLE:", req.body.listing.title);
//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings");
// }));

// // Edit Route for edit Listings
// app.get("/listings/:id/edit", warpAsync (async (req, res) => {
//     let {id} = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/edit.ejs", { listing });
// }));

// Update Route for save your data after editing
// app.put("/listings/:id", async (req , res) => {
//     let {id} = req.params;
//     await Listing.findByIdAndUpdate(id, {...req.body.listing});
//     res.redirect(`/listings/${id}`);
// });

// Delete Route for deleting Listings
// app.delete("/listings/:id", warpAsync (async (req, res) => {
//     let {id} = req.params;
//     let deletedListing = await Listing.findByIdAndDelete(id);
//     console.log(deletedListing);
//     res.redirect("/listings");
// }));

// app.use("/listings", listings); iske baad me -------------------------------------------------------

// Reviews Route
// Post Review Route
// app.post("/listings/:id/reviews", validateReview, warpAsync (async (req, res) => {
//    let listing = await Listing.findById(req.params.id);
//    let newReview = new Review(req.body.review);

//    listing.reviews.push(newReview);

//    await newReview.save();
//    await listing.save();

//     res.redirect(`/listings/${listing._id}`);
// }));

// // Delete Review Route 
// app.delete("/listings/:id/reviews/:reviewId", warpAsync (async (req, res) => {
//     let {id, reviewId} = req.params;
//     await Listing.findByIdAndUpdate(id, {$pull: {reviews : reviewId}})
//     await Review.findByIdAndDelete(reviewId);

//     res.redirect(`/listings/${id}`);
// }));

//app.use("listings/:id/reviews",reviews); iske baad me -------------------------------------

// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing ({
//         title : "My new Vilaa",
//         description : "By the beach",
//         price : 1200,
//         location : "Calangute, Goa",
//         country : "India",
//     });
//     await sampleListing.save();
//     console.log("Sample was seved");
//     res.send("Sucessful testing");
// });