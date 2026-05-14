const express = require("express");
const router = express.Router();
const db = require("../bd");
const auth = require("../controllers/auth");
const Lender  = require("../controllers/Lender");
const borrower  = require("../controllers/borrower");




router.post("/login", auth.login);
router.post("/register", auth.Register);
router.post("/publications", Lender.publications);
router.get("/brpublic", borrower.publications);

module.exports = router;
