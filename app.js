var express					= require('express'),
	bodyParser			 	= require('body-parser'), 
	 passport 				= require('passport'),
	localStrategy 			= require("passport-local"),
	 mongoose			 	= require('mongoose'),
	 Product 				= require('./models/product'),
	 passportLocalMongoose 	= require('passport-local-mongoose'),
	 User 					= require('./models/user'),
	 Details 				= require('./models/userDetails'),
	 middleware             = require("./middleware"),
	Insta                   = require("instamojo-nodejs"),
	url                     = require('url');
//Depriciation Warnings -- Solutions
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false); 
mongoose.set('useCreateIndex', true);

let main_cart=[];
//APP CONFIG
var app = express();
mongoose.connect("mongodb://localhost/yelp_camp",{useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(require("express-session")({
	secret : "i am the best",
	resave : false,
	saveUninitialized :false
}));
app.use(passport.initialize());
app.use(passport.session()); 


passport.use(new localStrategy(User.authenticate()));  
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




// Product.create({
// 	name: "Indian Economy",
// 	image:"https://n4.sdlcdn.com/imgs/f/h/5/230X258_sharpened/Indian-Economy-SDL773506381-1-08e66.webp",
// 	actualPrice: "Rs 550",
// 	sellingPrice: "Rs399",
// 	discount:"27%",
// 	category: "Books",
// }, function(err, product){
// 	if(err)
// 	console.log(err);
// 	 else
// 	 console.log("products have been added");
// 	 console.log(product);
// 	 });


app.use(function(req, res, next){
res.locals.currentUser = req.user;
	next();
});

let product = [];
var itemsInCart =0;
let products = [];

// HOME ROUTE
app.get('/', function(req,res){
	Product.find({},function(err,products){
		if(err)
			console.log(err);
		else{
			res.render('home', {product : products, currentUser : req.user});
		}
	});

});

// SHOW ROUTE
app.get('/products/:id',function(req, res){
		Product.findById(req.params.id, function(err, foundProduct){
			if(err){
				console.log(err);
			}else{
				res.render("show", {product : foundProduct,currentUser : req.user});
			}
			});	
});

//SHIPPING ROUTE
app.get('/shipping', middleware.isLoggedIn,function(req,res){
	res.render("shipping");
});


// History Route 
app.get('/history', function(req,res){
	res.render("history");
});


// PAYMENT ROUTE
app.get('/payment',function(req,res){
	

Insta.setKeys('test_106e049e58110907859d3f6cbd3','test_2ba33840facb227e08b241da63a');
Insta.isSandboxMode(true);

var data = new Insta.PaymentData();

data.purpose = "Test";            // REQUIRED
data.amount = 9;                  // REQUIRED
data.redirect_url = 'https://goorm-ide-test-phaom-debug.run.goorm.io/success';
// data.email = 'somwthing@gmail.com';  
// data.phone =123456789 ;

	
	Insta.createPayment(data, function(error, response) {
  if (error) {
    // some error
  	console.log(error);
  } else {
    // Payment redirection link at response.payment_request.longurl
    const responseData = JSON.parse(response);
	const redirectUrl = responseData.payment_request.longurl;
	 res.redirect(redirectUrl );
  }
});
	
});

//DETAILS ROUTE(post)
app.post('/addDetails',function(req,res){
	Details.create(req.body.details,function(err,details){
		if(err)
				console.log(err);
			else{
				console.log(details);
			
		User.findOne({username : req.user.username}, function(err,foundUser){
			foundUser.details.push(details._id);
			main_cart.forEach(function(products){
				foundUser.products.push(products.id);
			});
				foundUser.save(function(err,data){  
				if(err)						  
					console.log(err);
				else
					console.log(data);
			});
			
		});		
	}
			});			
	
		res.redirect('/');
});

//SUCCES ROUTE
app.get('/success',function(req,res){
	let url_parts = url.parse( req.url, true),
	responseData = url_parts.query;
	
});


// UPDATE ROUTE
app.post('/updateCart/:id',function(req, res){
	
	// console.log(req.params.id);

req.session.temp=[];
	let tempProducts = [];
	  products = main_cart;
	
	
	main_cart=[];
		
	products.forEach(function(product){
		
	 	
		if(req.params.id != product.id){
	 tempProducts	=	{name : product.name , image: product.image , Price1 : product.Price1 , Price2 : product.Price2 , discount : product.discount , id: product.id};
			main_cart.push(tempProducts);
			itemsInCart= main_cart.length;
		}
		});
		res.send("success");
});
	
	
	


// CART ROUTE(get)
app.get('/cart',function(req,res){
	res.render("cart",{products : main_cart , items : itemsInCart });
});




//CART ROUTE(post)
app.post('/addProduct/:id',function(req, res){
	Product.findById(req.params.id, function(err, addProduct){
		if(err){
				console.log(err);
		}else{
			if(main_cart){
				product = 
	{name : addProduct.name , image: addProduct.image , Price1 : addProduct.sellingPrice , Price2 : addProduct.actualPrice , discount : addProduct.discount , id: addProduct._id };
			main_cart.push(product);
			 }
			else{
				
				product = 
	{name : addProduct.name , image: addProduct.image , Price1 : addProduct.sellingPrice , Price2 : addProduct.actualPrice , discount : addProduct.discount , id: addProduct._id};
				
				
				main_cart.push(product);
			 }
           	itemsInCart= main_cart.length;
			
			res.redirect("/cart");
			}
			});	
});




// REGISTER ROUTES
app.get('/register',function(req,res){
	res.render('register');
});

app.post('/register',function(req,res){
	User.register(new User({username : req.body.username}), req.body.password, function(err,user){
		if(err){
			console.log(err);
			return res.render('register');
		} 
			passport.authenticate("local")(req, res, function(){
				res.redirect('/');
			});
		
	});
	
});
// LOGIN ROUTES
app.get("/login",function(req,res){
	res.render("login");
});

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) { 
    if (err) { return next(err); }    
    if (!user) { return res.redirect('/login'); }   
    req.logIn(user, function(err) {   
      if (err) { return next(err); }    
      var redirectTo = req.session.redirectTo ? req.session.redirectTo : '/';  
      delete req.session.redirectTo;   
      res.redirect(redirectTo);     
    });
  })(req, res, next);
});



app.get('/logout',function(req,res){
	req.logout();
	res.redirect("/");
});



app.get('*', function(req,res){
res.send("Sorry!! Page not found");
});


app.listen(9000,function(){
	console.log("server started");
});