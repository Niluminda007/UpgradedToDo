//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("loadsh");


mongoose.connect("mongodb://admin-ushan:admin@cluster0-shard-00-00.xcfmw.mongodb.net:27017,cluster0-shard-00-01.xcfmw.mongodb.net:27017,cluster0-shard-00-02.xcfmw.mongodb.net:27017/todolistDB?ssl=true&replicaSet=atlas-789w2t-shard-0&authSource=admin&retryWrites=true&w=majority");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

const itm1 = new Item({
  name: "Buy Food"
});
const itm2 = new Item({
  name: "Cook Food"
});

const itm3 = new Item({
  name: "Eat Food"
});

const defaultItems = [itm1, itm2, itm3];

checkForDefault();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));




app.get("/", function(req, res) {



    Item.find({}, function(err, items) {
      if (err) {
        console.log(err);
      } else {

        if (items.length > 0) {
          thereAreitems = true;
          res.render("list", {
            listTitle: "Today",
            newListItems: items
          });
        }
      }
    });

});


app.post("/", function(req, res) {

  const item = req.body.newItem;
  const listHeader = req.body.list;
  const itm = new Item({
    name: item
  });
  if(listHeader === "Today"){

    itm.save();
    res.redirect("/");
  }
else{
  List.findOne({name: listHeader},function(err,foundList){
    if(err){
      console.log(err);

    }
    else{
      foundList.items.push(itm);
      foundList.save();
      res.redirect("/"+listHeader);
    }
  });

}
});



app.post("/delete", function(req, res) {

const checkedID = req.body.checkbox;
const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedID, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Item has been delted Successfully");
        res.redirect("/");
      }
    });
  }
else{
  List.findOneAndUpdate({name: listName},{$pull: {items:{_id:checkedID}}},function(err){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/"+listName);
    }

  });
}
});

app.get('/:customListName', function(req, res) {

const customListName = _.capitalize(req.params.customListName);


List.findOne({name: customListName},function(err,foundList){
  if(!err){
    if(!foundList){
      //Create a new List
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      res.redirect("/"+customListName);
    }
    else{
      // render the current list
      res.render("list",{listTitle: foundList.name , newListItems: foundList.items })
    }
  }

});

});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});



function checkForDefault() {
  Item.find({}, function(err, items) {

    if (items.length == 0) {

      Item.insertMany([itm1, itm2, itm3], function(err) {
        if (err) {
          console.log(err);
        } else {
          thereAreitems = true;
          console.log("Success");
        }
      });

    }

  });
}
