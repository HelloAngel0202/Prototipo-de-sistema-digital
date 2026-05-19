const express = require("express");
const router = express.Router();
const db = require("../bd");
const auth = require("../controllers/auth");
const Lender  = require("../controllers/Lender");
const borrower  = require("../controllers/borrower");




router.post("/login", auth.login);
router.post("/register", auth.Register);
router.post("/verify-email", auth.verifyEmail);
router.put("/updateUser", auth.updateUser);
router.post("/publications", Lender.publications);
router.get("/userdate", auth.Userdate);
router.get("/checkClientData", auth.checkClientData);
router.get("/brpublic", borrower.publications);
router.get("/my-publications", borrower.publications);
router.post("/getRequestInfo", Lender.getRequestInfo);
router.get("/notifications", borrower.notifications);
router.get("/lender-info", Lender.getLenderInfo);
router.get("/accept-offer", borrower.acceptOffer);
router.get("/sended-notifications", borrower.sendedNotifications);
router.post("/lender-conditions", Lender.createLenderConditions);
router.get("/my-loans", borrower.myLoans);



module.exports = router;
