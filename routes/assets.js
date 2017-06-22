var express = require("express");
var router = express.Router();

router.get('/', function(request, response) {
  if (req.body ) {
    response.status(200).send("")
  } else if (req){
    response.status(400).send("We didn't make it ☹️");
  } else {
    response.status(x).send(y)
  }
})

module.exports = router;
