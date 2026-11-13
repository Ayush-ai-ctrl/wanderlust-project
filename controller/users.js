const User = require("../models/user");
const Listing = require("../models/listing");

module.exports.renderSingupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.singup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("ayushcode", "Welcome to WonderLust");
      let redirectUrl = req.session.redirectUrl || "/listings";
      delete req.session.redirectUrl;
      res.redirect(redirectUrl);
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderloginForm = async (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = (req, res) => {
  req.flash("ayushcode", "Welcome to WonderLust, You are logged in!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.profile = async (req, res) => {
  const user = await User.findById(req.user._id);
  const listings = await Listing.find({
    owner: req.user._id,
  });
  res.render("users/profile", {
    user,
    listings,
  });
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("ayushcode", "You are logged out now!");
    res.redirect("/listings");
  });
};
