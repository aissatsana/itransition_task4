const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const multer = require('multer');
const upload = multer();

const app = express();
const secretKey = crypto.randomBytes(32).toString('hex');
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true
}));

const port = 3000;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    registrationDate: { type: Date, default: Date.now },
    lastLoginDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Blocked', 'Active'], default: 'Active'},
});


const uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const User = mongoose.model('User', userSchema);
module.exports = User;


app.post('/register', upload.none(), async (req, res) => {
  try {
    const { name_register, email_register, password_register } = req.body;

  console.log(name_register, email_register, password_register);
    const existingUser = await User.findOne({ email: email_register });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password_register, 10);
    const newUser = new User({
      name: name_register,
      password: hashedPassword,
      email: email_register,
    });
    const savedUser = await newUser.save();
    console.log('Пользователь сохранен в базе данных:', savedUser);
    res.json({ message: 'Success' });
  } catch (error) {
    console.error('Ошибка при сохранении пользователя:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
});

app.post('/login', upload.none(), async (req, res) => {
  const { email_login, password_login } = req.body;
  try {
    const user = await User.findOne({ email: email_login });
    if (user) {
      if (user.status == 'Blocked') {
        res.json({ message: 'Пользователь заблокирован' });
      } else {
          const passwordMatch = await bcrypt.compare(password_login, user.password);
        if (passwordMatch && user.status == 'Active') {
          user.lastLoginDate = new Date();
          await user.save();
          req.session.user = user;
          res.redirect('/inner-page');
        } else {
          res.json({ message: 'Неверный пароль' });
        }
      }
      
    } else {
      res.json({ message: 'Пользователь с таким email не существует' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не получилось осуществить вход' });
  }
});

function formatDate( date ) {
  return date.toLocaleTimeString('en-US', { hour12: false}) + ', ' + date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}
  
app.get('/inner-page', async (req, res) => {
  try {
    console.log(req.session.user);
    const currentUser = await User.findById(req.session.user._id);
    if (currentUser && currentUser.status === 'Active') {
      const users = await User.find();
      res.setHeader('Content-Type', 'text/html');
      res.render('inner-page', { usersList: users, currentUser: currentUser, formatDate: formatDate });
    } else {
      res.redirect('index.html');
    }
  } catch (error) {
    console.error(error);
    res.redirect('index.html');
  }
});

app.post('/block-users', async (req, res) => {
  try {
    const { userIds } = req.body;
    await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { status: 'Blocked' } }
    );
    res.redirect('/inner-page');
  } catch (error) {
    console.error('Ошибка при обновлении статуса пользователей:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/unblock-users', async (req, res) => {
  try {
    const { userIds } = req.body;
    await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { status: 'Active' } }
    );
    res.redirect('/inner-page');
  } catch (error) {
    console.error('Ошибка при обновлении статуса пользователей:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/delete-users', async (req, res) => {
  try {
    const { userIds } = req.body;
    await User.deleteMany(
      { _id: { $in: userIds } },
    );
    res.redirect('/inner-page');
  } catch (error) {
    console.error('Ошибка при обновлении статуса пользователей:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Ошибка при выходе из сеанса:', err);
      res.status(500).json({ error: 'Что-то пошло не так!' });
    } else {
      res.redirect('/inner-page');
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
