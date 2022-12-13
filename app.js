import express from 'express';
import bodyParser from 'body-parser';
import https from 'https';
import mongoose from 'mongoose';
import assert from 'assert';
import _ from 'lodash';
// Set `strictQuery` to `false` to prepare for the change
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://admin-rahul:cullen000@cluster0.mhrmtrf.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });
const app = express();
app.set('view engine', 'ejs');
app.use(express.static("resources"));
app.use(bodyParser.urlencoded({ extended: true }));

//create Schemaaaa
const todoListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please insert the name"],
    },
});

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please insert the name"],
    },
    items: [todoListSchema],
});
//create mongoos model
const ItemModel = mongoose.model("Item", todoListSchema);
const ListModel = mongoose.model("List", listSchema);

//create default document items
const item1 = new ItemModel({
    name: "Welcome to your ToDo List",
});
const item2 = new ItemModel({
    name: "Hit the + button to add your new item",
});
const item3 = new ItemModel({
    name: "<-- Hit this to delete item",
});

const defaultItems = [item1, item2, item3];


app.get("/", function (req, res) {

    ItemModel.find({}, function (err, foundList) {
        console.log("result : " + foundList.length);
        const length = foundList.length;
        if (length === 0) {
            console.log("result 2 : " + foundList.length);
            ItemModel.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log("InsertMany DefaultItems : " + err);
                }
                else {
                    console.log("InsertMany DefaultItems Insert Success");
                }
            });
            res.redirect("/");
        }
        else {
            console.log("result 3 : " + foundList.length);
            res.render("list", { listTitle: "Today", newListItems: foundList });
        }

    });
});
app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new ItemModel({
        name: itemName,
    });
    if (listName === "Today") {
        item.save();
        res.redirect("/");
    }
    else {
        ListModel.findOne({
            name: listName
        }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }

});

app.post("/delete", function (req, res) {
    console.log(req.body.checkbox);
    const checkedID = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        ItemModel.findByIdAndRemove(checkedID, function (err) {
            if (err) {
                console.log("Delete error : " + err);
            }
            else {
                console.log("Deleted successfully");
                res.redirect("/");
            }
        });
    }
    else {
        ListModel.findOneAndUpdate({
            name: listName
        }, { $pull: { items: { _id: checkedID } } }, function (err, foundList) {
            if (err) {
                console.log("Delete error : " + err);
            }
            else {
                console.log("Deleted successfully");
                res.redirect("/" + listName);
            }

        });
    }
});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);
    ListModel.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new ListModel({
                    name: customListName,
                    items: defaultItems,
                });
                list.save();
                res.redirect("/" + customListName);
            }
            else {
                res.render("list", { listTitle: customListName, newListItems: foundList.items });
            }
        }

    })

})

app.get("/work", function (req, res) {
    res.render("list", {
        listTitle: "Work List", newListItems: workItems
    });
});
app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(3000, function (req, res) {
    console.log("Server running on 3000");
});