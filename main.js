const express = require("express")
const bodyParser = require("body-parser")
const path = require("path")
const multer = require('multer');
const session = require('express-session')
const { MongoClient, ObjectId } = require("mongodb")
const bcrypt = require('bcrypt');

const app = express()

const dbUrl = 'mongodb://localhost:27017'
const dbName = "DevMesh"

app.engine("html", require("ejs").renderFile)
app.set("view engine", "html")
app.use("/public", express.static(path.join(__dirname, "public")))
app.use('/uploads', express.static(path.join('uploads')));
app.set("views", path.join(__dirname, "/views"))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(session({
    secret: 'SECRETKEY',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } //maxAge: 60000
}))

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.get("/", async function(req, res) {
    if (req.session.userId) {
        try {
            const client = await MongoClient.connect(dbUrl);
            const db = client.db(dbName);
            const users = db.collection("Users");
            const posts = db.collection("Posts");
        
            const userId = new ObjectId(req.session.userId);

            var user = await users.findOne({ _id: userId });
            var allPosts = await posts.find({}).sort({createdAt: -1}).toArray();

            if (user) {
                res.render("main/home.html", { user: user, posts: allPosts });
            } else {
                req.session.destroy(() => {
                    res.redirect("/auth/sign");
                });
            }
        } catch (err) {
            console.error(err);
            res.redirect("/auth/sign");
        }   
    } else {
        req.session.redirectTo = req.originalUrl;
        res.redirect('/auth/sign');
        return;
    }
});

app.get("/:page?", async function(req, res) {
    if (req.session.userId) {
        try {
            const page = req.params.page || "Home"

            const client = await MongoClient.connect(dbUrl);
            const db = client.db(dbName);
            const users = db.collection("Users");
            const posts = db.collection("Posts");
        
            const userId = new ObjectId(req.session.userId);

            var user = await users.findOne({ _id: userId });

            if (user) {
                if (page == "profile") { 
                    var userPosts = await posts.find({ author: user.Name }).sort({ createdAt: -1 }).toArray();

                    res.render(`main/${page}.html`, { user: user, posts: userPosts, isUser: true });
                } else {
                    res.render(`main/${page}.html`, { user: user });
                }
            } else {
                req.session.destroy(() => {
                    res.redirect("/auth/sign");
                });
            }
        } catch (err) {
            console.error(err);
            res.redirect("/auth/sign");
        }   
    } else {
        req.session.redirectTo = req.originalUrl
        res.redirect('/auth/sign')
        return
    }
})

app.get('/profile/user/:userid', async (req, res) => {
    const userId = req.params.userid;

    try {
        const client = await MongoClient.connect(dbUrl);
        const db = client.db(dbName);
        const users = db.collection('Users');
        const posts = db.collection("Posts");

        const user = await users.findOne({ _id: new ObjectId(userId) });

        if (req.session.userId) {
            if (user) {
                var userPosts = await posts.find({ author: user.Name }).sort({ createdAt: -1 }).toArray();
                res.render('main/profile', { user: user, posts: userPosts, isUser: (req.params.userid == req.session.userId) });
            } else {
                res.status(404).send('User not found');
            }
        } else {
            req.session.redirectTo = req.originalUrl
            res.redirect('/auth/sign')
            return
        }   
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/auth/logout', (req, res) => {
    req.session.destroy((err) => { res.redirect('/') })
})

app.get("/auth/sign", (req, res) => {
    res.render(`auth/sign.html`, {}, (err, html) => {
        if (err) res.redirect("/")
        else res.send(html)
    })
})

app.post('/auth/sign', async (req, res) => {
    if (req.body.login_user) {
        const { username_or_email, passwordvalue } = req.body;
        let errors = {};
    
        try {
            const client = await MongoClient.connect(dbUrl);
            const db = client.db(dbName);
            const users = db.collection("Users");
    
            const user = await users.findOne({ $or: [{ Username: username_or_email }, { Email: username_or_email }] });

            if (!user) errors.username_or_email = "User not found";
            else {
                const match = await bcrypt.compare(passwordvalue, user.Password);
                if (!match) errors.passwordvalue = "Incorrect Password";
            }

            if (Object.keys(errors).length > 0) {
                
                res.render('auth/sign', { 
                    debug: { errors: errors},
                        fields: {
                        username_or_email: req.body.username_or_email
                    }
                });
            } else {
                req.session.userId = user._id;
        
                if (req.session.redirectTo) {
                    const redirectUrl = req.session.redirectTo || '/';
                    delete req.session.redirectTo;
                    res.redirect(redirectUrl);
                } else res.redirect('/');
            }
        } catch (err) {
            res.render('auth/sign', { debug: { error: 'Error accessing users'} });
        }
    } else {
        const { email, name, username, location, workarea, password_field, confirm_password } = req.body;
        let errors = {};
      
        if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
          errors.email = 'Please enter a valid email address.';
        }
      
        if (username.length < 3) {
          errors.username = 'Username must be at least 3 characters long.';
        }
      
        if (name.length < 3) {
          errors.name = 'Name must be at least 3 characters long.';
        }

        if (password_field != confirm_password) {
          errors.password = 'Passwords do not match.';
        } else {
          if (password_field.length < 8) {
            errors.password = "Password must be at least 8 characters long.";
          } else if (!/[a-z]/.test(password_field)) {
            errors.password = "Password must contain at least one lowercase letter.";
          } else if (!/[A-Z]/.test(password_field)) {
            errors.password = "Password must contain at least one uppercase letter.";
          } else if (!/\d/.test(password_field)) {
            errors.password = "Password must contain at least one digit.";
          } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password_field)) {
            errors.password = "Password must contain at least one special character.";
          }
        }  

        if (Object.keys(errors).length > 0) {
          res.render('auth/sign', { debug: { errors: errors } });
          return;
        }
      
        try {
          const client = await MongoClient.connect(dbUrl);
          const db = client.db(dbName);
          const users = db.collection("Users");
      
          const existingUser = await users.findOne({ $or: [{ Email: email }, { Username: username }] });
      
          if (existingUser) {
            errors.email = 'Email or username already exists. Please choose another.';
            errors.username = 'Email or username already exists. Please choose another.';
            
            res.render('auth/sign', { debug: { errors: errors } });
            return;
          } else {
            const hashedPassword = await bcrypt.hash(password_field, 10);
      
            await users.insertOne({
              Email: email,
              Name: name,
              Username: username,
              Location : location,
              WorkArea : workarea,
              Followers : [],
              Following : [],
              Social: {},
              Password: hashedPassword,
              Image: "/public/img/profile/DefaultProfileIcon.png",
              ThumbImage: "/public/img/profile/DefaultProfileThumbnail.png",
              Info: {
                About: "",
                Experience: [],
                Education: [],
                Skills: []
              },
              Reviews: [],
              Portflio: []
            });
        
            res.redirect('/auth/sign?success=User+registered+successfully');
          }
        } catch (err) {
          res.render('auth/sign', { debug: { error: 'Error accessing the database'} });
        }
    }
    
});
  
app.post('/addpost', async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        const userId = req.session.userId;

        const client = await MongoClient.connect(dbUrl);
        const db = client.db(dbName);

        const users = db.collection("Users");
        const user_id = new ObjectId(userId)
        const user = await users.findOne({ _id: user_id });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const post = {
            title,
            content,
            tags,
            likes: [],
            comments: [],
            views: 0,
            author: user.Name, 
            createdAt: new Date()
        };

        const posts = db.collection("Posts");
        await posts.insertOne(post);

        res.status(200).json({ message: 'Post published successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to publish post.' });
    }
});

app.post('/update-social', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).send('Not authorized');
    }

    const { social, value } = req.body;
    
    try {
        const client = await MongoClient.connect(dbUrl);
        const db = client.db(dbName);
        const users = db.collection("Users");
        
        const updateField = `Social.${social}`;
        await users.updateOne({ _id: new ObjectId(req.session.userId) }, { $set: { [updateField]: value } });

        res.status(200).json({ message: 'Social media link updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update social media link.' });
    }
});

app.post('/add-experience', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).send('Not authorized');
    }

    const { role, company, startYear, endYear, description } = req.body;
    const userId = req.session.userId;

    try {
        const client = await MongoClient.connect(dbUrl);
        const db = client.db(dbName);
        const users = db.collection("Users");

        await users.updateOne(
            { _id: new ObjectId(userId) },
            { $push: { "Info.Experience": { role, company, startYear, endYear, description } } }
        );

        res.status(200).json({ message: 'Experience added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add experience.' });
    }
}).post('/add-education', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).send('Not authorized');
    }

    const { degree, school, startYear, endYear, description } = req.body;
    const userId = req.session.userId;

    try {
        const client = await MongoClient.connect(dbUrl);
        const db = client.db(dbName);
        const users = db.collection("Users");

        await users.updateOne(
            { _id: new ObjectId(userId) },
            { $push: { "Info.Education": { degree, school, startYear, endYear, description } } }
        );

        res.status(200).json({ message: 'Education added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add education.' });
    }
}).post('/update-skills', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).send('Not authorized');
    }

    const { skill } = req.body;
    const userId = req.session.userId;

    try {
        const client = await MongoClient.connect(dbUrl);
        const db = client.db(dbName);
        const users = db.collection("Users");

        await users.updateOne(
            { _id: new ObjectId(userId) },
            { $push: { "Info.Skills": skill } }
        );

        res.status(200).json({ message: 'Skill updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update skill.' });
    }
}).post('/edit-about', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).send('Not authorized');
    }

    const { about } = req.body;
    const userId = req.session.userId;

    try {
        const client = await MongoClient.connect(dbUrl);
        const db = client.db(dbName);
        const users = db.collection("Users");

        await users.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { "Info.About": about } }
        );

        res.status(200).json({ message: 'About Me updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update About Me.' });
    }
}).post('/edit-location', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).send('Not authorized');
    }

    const { location } = req.body;
    const userId = req.session.userId;

    try {
        const client = await MongoClient.connect(dbUrl);
        const db = client.db(dbName);
        const users = db.collection("Users");

        await users.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { "Location": location } }
        );

        res.status(200).json({ message: 'Location updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update location.' });
    }
}).post('/delete-experience', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).send('Not authorized');
    }

    const { index } = req.body;
    const userId = req.session.userId;

    try {
        const client = await MongoClient.connect(dbUrl);
        const db = client.db(dbName);
        const users = db.collection("Users");

        const user = await users.findOne({ _id: new ObjectId(userId) });

        user.Info.Experience.splice(index, 1);

        await users.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { "Info.Experience": user.Info.Experience } }
        );

        res.status(200).json({ message: 'Experience deleted successfully!' });
    } catch (error) {
        console.error('Failed to delete experience:', error);
        res.status(500).json({ message: 'Failed to delete experience.' });
    }
}).post('/delete-education', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).send('Not authorized');
    }

    const { index } = req.body;
    const userId = req.session.userId;

    try {
        const client = await MongoClient.connect(dbUrl);
        const db = client.db(dbName);
        const users = db.collection("Users");

        const user = await users.findOne({ _id: new ObjectId(userId) });

        user.Info.Education.splice(index, 1);

        await users.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { "Info.Education": user.Info.Education } }
        );

        res.status(200).json({ message: 'Experience deleted successfully!' });
    } catch (error) {
        console.error('Failed to delete experience:', error);
        res.status(500).json({ message: 'Failed to delete experience.' });
    }
}).post('/edit-educationitem', async (req, res) => {
    const userId = req.session.userId;
    const { index, degree, school, startYear, endYear, description } = req.body;

    const client = await MongoClient.connect(dbUrl);
    const db = client.db(dbName);
    const users = db.collection('Users');

    const user = await users.findOne({ _id: new ObjectId(userId) });

    if (!user) {
        return res.status(404).send('User not found');
    }

    user.Info.Education[index] = { degree, school, startYear, endYear, description };

    await users.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { "Info.Education": user.Info.Education } }
    );

    res.status(200).send('Education updated successfully');
}).post('/edit-experienceitem', async (req, res) => {
    const userId = req.session.userId;
    const { index, role, company, startYear, endYear, description } = req.body;

    const client = await MongoClient.connect(dbUrl);
    const db = client.db(dbName);
    const users = db.collection('Users');

    const user = await users.findOne({ _id: new ObjectId(userId) });

    if (!user) {
        return res.status(404).send('User not found');
    }

    user.Info.Experience[index] = { role, company, startYear, endYear, description };

    await users.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { "Info.Experience": user.Info.Experience } }
    );

    res.status(200).send('Experience updated successfully');
}).post('/delete-skill', async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).send('Not authorized');
    }

    const { skill } = req.body;
    const userId = req.session.userId;

    try {
        const client = await MongoClient.connect(dbUrl);
        const db = client.db(dbName);
        const users = db.collection("Users");

        await users.updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { "Info.Skills": skill } }
        );

        res.status(200).json({ message: 'Skill deleted successfully!' });
    } catch (error) {
        console.error('Failed to delete skill:', error);
        res.status(500).json({ message: 'Failed to delete skill.' });
    }
});

app.post('/add-project', upload.single('projectImage'), async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).send('Not authorized');
    }

    try {
        const { projectLink } = req.body;
        const projectImage = "/" + req.file.path;

        const client = await MongoClient.connect(dbUrl);
        const db = client.db(dbName);
        const users = db.collection("Users");

        const newProject = {
            projectLink,
            projectImage,
            createdAt: new Date()
        };

        await users.updateOne(
            { _id: new ObjectId(req.session.userId) }, 
            { $push: { Portfolio: newProject } }
        );

        res.status(200).json({ message: 'Project added successfully to your portfolio' });
    } catch (error) {
        console.error('Failed to add project to portfolio:', error);
        res.status(500).json({ message: 'Failed to add project to portfolio.' });
    }
});

app.post('/add-review', async (req, res) => {
    try {
        const userId = req.session.userId;

        var starRating = req.body.starRating
        var reviewText = req.body.reviewText
        var rattedUserId = req.body.ratteduserid

        const client = await MongoClient.connect(dbUrl);
        const db = client.db(dbName);
        const users = db.collection('Users');

        const reviewer = await users.findOne({ _id: new ObjectId(userId) });
        if (!reviewer) {
            return res.status(404).send('Reviewer user not found');
        }
        const reviewerUsername = reviewer.Username;

        const review = {
            Username: reviewerUsername,
            Body: reviewText,
            Stars: parseInt(starRating, 10),
            Comments: [],
            createdAt: new Date()
        };

        await users.updateOne(
            { _id: new ObjectId(rattedUserId) },
            { $push: { Reviews: review } }
        );

        res.status(200).json({ message: 'Review added successfully!' });
    } catch (error) {
        console.error('Failed to add review:', error);
        res.status(500).json({ message: 'Failed to add review.' });
    }
});

app.post('/update-profile-image', upload.single('profileimage'), async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).send('Not authorized');
    }

    try {
        const client = await MongoClient.connect(dbUrl);
        const db = client.db(dbName);
        const users = db.collection("Users");

        const userId = req.session.userId;
        const imagePath = '/uploads/' + req.file.filename;

        await users.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { Image: imagePath } }
        );

        res.status(200).json({ message: 'Profile image updated successfully!' });
    } catch (error) {
        console.error('Failed to update profile image:', error);
        res.status(500).send('Failed to update profile image.');
    }
}).post('/update-profile-thumb-image', upload.single('profilethumbimage'), async (req, res) => {
    if (!req.session.userId) {
        return res.status(403).send('Not authorized');
    }

    try {
        const client = await MongoClient.connect(dbUrl);
        const db = client.db(dbName);
        const users = db.collection("Users");

        const userId = req.session.userId;
        const imagePath = '/uploads/' + req.file.filename;

        await users.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { ThumbImage: imagePath } }
        );

        res.status(200).json({ message: 'Profile image updated successfully!' });
    } catch (error) {
        console.error('Failed to update profile image:', error);
        res.status(500).send('Failed to update profile image.');
    }
});



const PORT = 8001
app.listen(PORT, () => {
    console.log(`Brain Burst running on Page http://localhost:${PORT}`)
})