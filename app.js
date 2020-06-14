var express = require('express'),
	mongoose = require("mongoose"),
	passport = require('passport'),
	bodyParser = require('body-parser'),
	LocalStrategy = require('passport-local'),
	path = require('path'),
	passportLocalMongoose = require('passport-local-mongoose'),
	User = require('./models/user'),
	Event = require('./models/event');

const { ObjectID } = require('mongodb');

mongoose.connect("mongodb://localhost:27017/wtmkolkata", { useNewUrlParser: true });

const port = process.env.PORT || 3000;


var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('express-session')({
	secret: 'This is the secret',
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =========
// ROUTES
// =========

app.get('/', (req, res) => {
	res.render('home');
});
app.get('/indev', (req, res) => {
	res.render('indev');
});
app.get('/events', (req, res) => {
	Event.find({}, (err, events) => {
		res.render('events', { events })
	});
});

app.get('/dashboard', isLoggedIn, (req, res) => {
	Event.find({}, (err, events) => {
		res.render('dashboard', { events })
	});
});

app.get('/addEvent', isLoggedIn, (req, res) => {
	res.render('addEvent');
});

app.post('/addEvent', isLoggedIn, (req, res) => {
	var event = new Event({
		title: req.body.title,
		image: req.body.image,
		date: req.body.date,
		from: req.body.from,
		to: req.body.to,
		description: req.body.description,
		venue: req.body.venue
	});

	event.save().then((doc) => {
		res.redirect('/dashboard');
	}, (e) => {
		res.status(400).send(e);
	});
});

app.get('/events/:title', isLoggedIn, (req, res) => {
	var title = req.params.title;
	// if(!ObjectID.isValid(id)) {
	// 	return res.status(404).send();
	// }
	Event.findOne({
		title: title
	}).then((event) => {
		if (!event) {
			return res.status(404).send();
		}
		res.send({ event })
	}).catch((e) => {
		res.status(400).send();
	});
});

app.get('/events/delete/:title', isLoggedIn, (req, res) => {
	var title = req.params.title;
	// if(!ObjectID.isValid(id)) {
	// 	return res.status(404).send();
	// }
	Event.findOneAndRemove({
		title: title
	}).then((event) => {
		if (!event) {
			return res.status(404).send();
		}
		res.send({ event })
	}).catch((e) => {
		res.status(400).send();
	});
});

// Auth Routes
// Signup routes
app.get('/admin/register', (req, res) => {
	res.render('register');
});
app.post('/admin/register', (req, res) => {
	User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
		if (err) {
			console.log(err);
			return res.render('register');
		}
		passport.authenticate('local')(req, res, () => {
			res.redirect('/dashboard');
		})
	});
});

// Signin routes
app.get('/admin/login', (req, res) => {
	res.render('login');
});
app.post('/admin/login', passport.authenticate('local', {
	successRedirect: '/dashboard',
	failureRedirect: '/admin/login'
}), (req, res) => {

});

app.get('/admin/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/admin/login');
};


app.listen(port, () => {
	console.log(`Server is up on port ${port}`);
});