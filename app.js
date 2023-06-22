const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express();
const _ = require("lodash")


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));





app.set('view engine','ejs');

mongoose.connect("mongodb+srv://Aashrith:Aashrith@cluster0.nqgy9z7.mongodb.net/todolist");

const itemsSchema = {
    name : String

}

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name : "Welcome to your todolist !"
});
const item2 = new Item({
    name : "Hit the > button to add a new item."
});
const item3 = new Item({
    name : "<--- Hit this to delete an item"
});

const defaultItems =[item1,item2,item3];

const listSchema ={
    name :String,
    items : [itemsSchema]
}
const List = mongoose.model("List",listSchema);

app.get("/", async function(req,res){
    
    const foundItems = await Item.find({})
    if(foundItems.length===0)
    {
        Item.insertMany(defaultItems);
        res.redirect("/");
    }
    else{
    res.render("list",{Title: "Today",
                lists : foundItems,
                action : "/"
    });
}

});


app.post("/",function(req,res){
    let item = req.body.todo;
     if(item != ""){
    Item.create({name : item});
    
     }
     res.redirect('/');
})
app.post("/delete",async function(req,res){
   const id = req.body.checkbox;
   
   const listname = req.body.listname;
  if(listname=="Today")
  {
    await Item.findByIdAndRemove(id);
    res.redirect('/');
  }else{
    await List.findOneAndUpdate({name : listname}, { $pull : { items :{_id:id}}},);
   res.redirect("/"+listname);
  }
})


app.get("/:customListName",async function(req,res){
    const customListName =  _.capitalize(req.params.customListName);
    const foundList =await List.findOne({name : customListName})
    if(foundList == null)
    {
        const list = new List({
            name : customListName,
            items : defaultItems
           });
           
           list.save();
           res.redirect("/"+customListName);
    }
    else
    {
        res.render("list",{Title: foundList.name,
                lists : foundList.items,
                action :"/"+customListName
                
    });
    }
   

});


app.post("/:customListName", async function(req,res){
       let item =  _.capitalize(req.body.todo);
       const customListName =  req.params.customListName;
       if(item!=""){
       
       await List.findOneAndUpdate({name : customListName},{$push :{items:{name :item}}}); 
       
      
       }
       res.redirect("/"+customListName);
}
)


app.get("/about",function(req,res){
    res.render("about");
})




app.listen(process.env.PORT||3000,function(){
    console.log("The sever is up and running at port 3000.");
});



