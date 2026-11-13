const express = require("express");
const router = express.Router();
const warpAsync = require("../utils/warpAsync.js"); // for error handling in async function
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js"); // for require middleware.js in logIn & signIn

const listingController = require("../controller/listings.js"); // for require listings.js in controller
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

// Index Route & Create Route
router
  .route("/")
  .get(warpAsync(listingController.index))
  .post(isLoggedIn, validateListing, upload.single("listing[image]"),warpAsync(listingController.createNew));


// Search Route
router.get(
  "/search",
  warpAsync(listingController.searchListings)
);

//  New Route For create new Listing form
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show Route & Update Route for save your data after editing Delete Route for deleting Listings
router
  .route("/:id")
  .get(warpAsync(listingController.showRoute))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"), validateListing, warpAsync(listingController.updateAfterEdit)
  )
  .delete(isLoggedIn, isOwner, warpAsync(listingController.deleteListing));

// Edit Route for edit Listings
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
warpAsync(listingController.editListing)
);

module.exports = router;
