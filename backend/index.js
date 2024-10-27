const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { type } = require('os');
const { error, log } = require('console');

app.use(express.json());
app.use(cors());

// DB connection with MongoDB
mongoose.connect("mongodb+srv://hoangvbhp142:hoangviettran1402@cluster0.3o3anuc.mongodb.net/");

//API Creation
app.get("/", (req, res) => {
    res.send("Hello");
});

//Image storage engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
});

const upload = multer({storage: storage});

//Create upload endpoint for images
app.use("/images", express.static("upload/images"));
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

//Schema for creating products
const Product = mongoose.model("Product", {
    id: {
        type: Number,
        require: true,
    },
    name: {
        type: String,
        require: true,
    },
    image: {
        type: String,
        require: true,
    },
    category: {
        type: String,
        require: true,
    },
    new_price: {
        type: Number,
        require: true,
    },
    old_price: {
        type: Number,
        require: true,
    },
    date: {
        type: Date,
        default: Date.now(),
    },
    available: {
        type: Boolean,
        default: true,
    }
})

app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id;
    if(products.length > 0){
        let lastproduct_array = products.slice(-1);
        let lastproduct = lastproduct_array[0];
        id = lastproduct.id + 1;
    }
    else{
        id = 1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price
    });
    console.log(product);
    await product.save();
    console.log("saved");
    res.json({
        success: true,
        name: req.body.name,
    });
});

//Create API for deleting product
app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({
        id: req.body.id
    });
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name,
    });
});

//Create API for getting all products
app.get('/allproducts', async (req, res) => {
    let products = await Product.find({});
    console.log("Fetch");
    res.send(products);
});

//Schema creating user model
const Users = mongoose.model("Users", {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now(),
    }
});

//Creating endpoint for registering user
app.post('/signup', async (req, res) => {
    let cart = {};
    for (let index = 0; index < 300; index++) {
        cart[index] = 0;
    }
    console.log("Body:", req.body);
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (req.body.name == '' || req.body.email == '' || req.body.password == '') {
        return res.status(400).json({ success: false, error: "Vui lòng điền đủ thông tin!" });
    }
    if (!emailPattern.test(req.body.email)) {
        return res.status(400).json({ success: false, error: "Vui lòng nhập đúng định dạng email!" });
    }
    if (req.body.password.length < 8) {
        return res.status(400).json({ success: false, error: "Mật khẩu phải có ít nhất 8 kí tự!" });
    }
    const user = new Users({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    });

    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, error: "Email đã tồn tại" });
    }

    await user.save();

    const data = {
        user: {
            id: user.id,
        }
    }
    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success: true, token });
});

// creating endpoint for user login
app.post('/login', async (req, res) => {
    if (req.body.email == '' || req.body.password == '') {
        return res.status(400).json({ success: false, error: "Vui lòng điền đủ thông tin!" });
    }
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id,
                }
            }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({ success: true, token });
        }
        else {
            res.json({ success: false, error: "Sai tài khoản hoặc mật khẩu!" });
        }
    }
    else {
        res.json({ success: false, error: "Sai tài khoản hoặc mật khẩu!" });
    }
});

// creating endpoint for new collection data
app.get('/newcollection', async (req, res) => {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("new collection fetch");
    res.send(newcollection);
})

// creating endpoint for popular in women
app.get('/popularinwomen', async (req, res) => {
    let product = await Product.find({category: "women"});
    let popularinwomen = product.slice(0, 4);
    console.log("popular women fetch");
    res.send(popularinwomen);
})

//creating middleware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error: "Please authenticate using valid token"});
    }
    else{
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        }
        catch (error) {
            res.status(401).send({error: "Please authenticate using valid token"});
        }
    }
}

//creating endpoint for adding product in cart
app.post('/addtocart', fetchUser, async (req, res) => {
    console.log('added', req.body.itemId);
    let userData = await Users.findOne({_id: req.user.id});
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData});
    res.send("Added");
});

//creating endpoint to remove product from cartdata
app.post('/removefromcart', fetchUser, async (req, res) => {
    console.log('remove', req.body.itemId);
    let userData = await Users.findOne({_id: req.user.id});
    if(userData.cartData[req.body.itemId] > 0){
        userData.cartData[req.body.itemId] -= 1;
    }
    await Users.findOneAndUpdate({_id: req.user.id}, {cartData: userData.cartData});
    res.send("Removed");
});

//get cartdata
app.post('/getcart', fetchUser, async (req, res) => {
    console.log("get cart");
    let userData = await Users.findOne({_id: req.user.id});
    res.json(userData.cartData);
});

app.listen(port, (error) => {
    if(!error){
        console.log("Server is running on port " + port);
    }
    else{
        console.log("Error "+ error);
    }
});