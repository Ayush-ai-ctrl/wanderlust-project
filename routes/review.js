const express = require("express");
const router = express.Router({mergeParams : true});
const warpAsync = require("../utils/warpAsync.js"); // for error handling in async function
const ExpressError = require("../utils/ExpressError.js"); // for custom error handling
const Review = require("../models/review.js");
const Listing = require("../models/listing.js")
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const { createReview, destroyReview } = require("../controller/reviews.js");

const reviewController = require("../controller/reviews.js")  // for require reviews.js in controller 


// Post Review Route
router.post("/", isLoggedIn, validateReview,warpAsync (reviewController.createReview));

// Delete Review Route 
router.delete("/:reviewId", isLoggedIn,isReviewAuthor,warpAsync (reviewController.destroyReview));

module.exports = router;