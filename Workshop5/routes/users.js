var express = require('express');
var router = express.Router();

/*
* GET CommodityList.
*/

router.get('/commodities', function(req, res) {
  //Get the data
  req.commodity.find()
    .then(docs => {
      console.log(docs);
      res.json(docs);
    })
    .catch(err => {
      res.send({msg: err });
  });
});

/*
* POST to add commodity
*/

router.post('/addcommodity', function (req, res) {
  var addRecord = new req.commodity({
    category: req.body.category,
    name: req.body.name,
    status: req.body.status
});
  //add new commodity document
  addRecord.save()
  .then(() => {res.send({ msg: '' });} )
  .catch(err => res.send({ msg: err }));
});

/*
* DELETE to delete a commodity.
*/

router.delete('/deletecommodity/:id', function(req, res) {
  var _id = req.params.id;
  req.commodity.findByIdAndDelete(_id)
    .then(() => {res.send({ msg: '' });})
    .catch(err => res.send({ msg: err }));
  });

/*
* PUT to update a commodity (status)
*/
router.put('/updatecommodity/:id', function (req, res) {
  var commodityToUpdate = req.params.id;
  var newStatus = req.body.status;
  //TO DO: update status of the commodity in commodities collection, according to commodityToUpdate and newStatus
  req.commodity.findByIdAndUpdate(commodityToUpdate, {status: newStatus})
    .then(() => {res.send({ msg: '' });})
    .catch(err => res.send({ msg: err }));
});
module.exports = router;
