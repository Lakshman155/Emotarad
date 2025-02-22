const express=require("express")

const router = express.Router()
// importing identifyController from controllers
const {identify}=require("../controllers/identifyController")

router.post('/identify', identify);

module.exports=router;