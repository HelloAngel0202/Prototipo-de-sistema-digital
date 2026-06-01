const express = require("express");
const router = express.Router();
const db = require("../bd");
const auth = require("../controllers/auth");
const Lender = require("../controllers/Lender");
const borrower = require("../controllers/borrower");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/login", auth.login);
router.post("/register", auth.Register);
router.post("/verify-email", auth.verifyEmail);

router.put(
  "/updateUser",
  upload.single("profile_image"),
  auth.updateUser
);

router.post("/publications", Lender.publications);
router.get("/userdate", auth.Userdate);
router.get("/Clidate", auth.Clidate);
router.get("/checkClientData", auth.checkClientData);
router.get("/brpublic", borrower.publications);
router.get("/my-publications", borrower.publications);
router.post("/getRequestInfo", Lender.getRequestInfo);
router.get("/notifications", borrower.notifications);
router.get("/lender-info", Lender.getLenderInfo);
router.get("/accept-offer", borrower.acceptOffer);
router.get("/sended-notifications", borrower.sendedNotifications);
router.post("/lender-conditions", Lender.createLenderConditions);
router.post("/register-loan", Lender.registerLoan);
router.get("/get-lender-conditions-by-request", Lender.getLenderConditionsByRequest);
router.get("/my-loans", borrower.myLoans);
router.get("/show-lender-conditions", Lender.showLenderConditions);
router.get("/accept-access", borrower.acceptAccess);
router.get("/get-client-request", Lender.getClientRequest);

module.exports = router;