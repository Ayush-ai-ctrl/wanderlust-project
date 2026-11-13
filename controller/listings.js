const Listing = require("../models/listing");
const Review = require("../models/review");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// controller for index route
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

module.exports.searchListings = async (req, res) => {
  console.log(req.query);

  let { query } = req.query;

  const listings = await Listing.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { location: { $regex: query, $options: "i" } },
    ],
  });

  res.render("listings/index", {
    allListings: listings,
  });
};

// Controller for create route
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// Controller for Show route
module.exports.showRoute = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

//  Controller for Create Route
module.exports.createNew = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();
    
  let url = req.file.path;
  let filename = req.file.filename;

  // console.log("REQ.BODY:", req.body);
  // console.log("TITLE:", req.body.listing.title);
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry = response.body.features[0].geometry;

  let saveListing = await newListing.save();
  console.log(saveListing);
  req.flash("ayushcode", "New listing Created Successfully!");
  res.redirect("/listings");
};

//  Controller for Edit Route
module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }

  let originalUrlImage = listing.image.url;
  originalUrlImage1 = originalUrlImage.replace(
    "/upload/",
    "/upload/h_300,w_250/",
  ); //c_fill,h_300,w_250/e_blur:300/
  res.render("listings/edit.ejs", { listing, originalUrlImage1 });
};

//  Controller for Update Listing after Edit listing
module.exports.updateAfterEdit = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("ayushcode", "Listing Updated Successfully!");

  // listing.title = req.body.listing.title;
  // listing.description = req.body.listing.description;
  // listing.location = req.body.listing.location;
  // listing.country = req.body.listing.country;
  // listing.price = req.body.listing.price;
  // listing.image.url = req.body.listing.image;   // sirf url update, poora object nahi &  agar new image ko update karna hai to use copy image address link karne karo

  // await listing.save();
  res.redirect(`/listings/${id}`);
};

// Controller for Delete Listing
module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("ayushcode", "Listing was deleted successfully");
  res.redirect("/listings");
};
