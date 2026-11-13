const express = require("express");
const router = express.Router();
const User = require("../models/user");
const warpAsync = require("../utils/warpAsync");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware");

const userscontroller = require("../controller/users");

// SignUp Route
router
  .route("/signup")
  .get(userscontroller.renderSingupForm)
  .post(warpAsync(userscontroller.singup));

// Login Route
router
  .route("/login")
  .get(userscontroller.renderloginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userscontroller.login,
  );

// Profile Route
router.get("/profile", isLoggedIn, userscontroller.profile);

// Logout Route
router.get("/logout", userscontroller.logout);

module.exports = router;
