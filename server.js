var express = require('express'); // Require the Express Module
var app = express(); // Create an Express App
var bodyParser = require('body-parser');// Require body-parser (to receive post data from clients)
var path = require('path');// Require path
const flash = require('express-flash');
var mongoose = require('mongoose');
var session = require('express-session');
mongoose.Promise = global.Promise;


// Configuration
app.use(flash());
app.use(express.static(path.join(__dirname, './static')));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.use(session({
    secret: "hi im alex",
    saveUninitialized: true,
    resave: false,
    cookie:{
        maxAge: 60000
    }
}))

// Database
mongoose.connect('mongodb://localhost/quoting');


var QuoteSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 1 },
    quote: { type: String, required: true, minlength: 1 },
    }, {timestamps: true});

   mongoose.model('Quote', QuoteSchema); // We are setting this Schema in our Models as 'User'
   var Quote = mongoose.model('Quote') // We are retrieving this Schema from our Models, named 'Quote'


// Routes
app.get('/', function(req, res) { // The root route -- we want to get all of the quotes from the database and then render the index view
            res.render('index');
})
  
app.post('/quotes', function(req, res) { // This is where we would add the quotes from req.body to the database.
    console.log("POST QUOTE", req.body);
    var new_quote = new Quote({name: req.body.name, quote: req.body.quote},{
        timestamps: req.body.createdAt
    });
    new_quote.save(function(err){
        if(err){
            console.log("Something went wrong!", err);
            for(var key in err.errors){
                req.flash('quote', err.errors[key].message)
            }
            res.redirect('/')
        }
        else{
            console.log("Quote successfully added!")
            res.redirect('/quotes');
        }
    })
})

app.get('/quotes', function(req, res) { // Route to quotes page
    console.log("Quote page!", req.body);
    Quote.find({}, function(err, quotes) {
        if(err){
            console.log("Find quotes error.", err)
        }
        else{
            console.log("Successfully found quotes")
            res.render('quotes', {quotes: quotes}); // {client-side: server-side}
        }
    })
})


app.listen(8000, function() { // Setting our server to listen on Port: 8000
    console.log("listening on port 8000");
})