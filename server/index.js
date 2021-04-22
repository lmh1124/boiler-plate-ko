const express = require('express') // express 모듈을 가져옴.
const app = express() // 새로운 express 앱을 만듦.
const port = 5000 // 포트 번호.
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key'); // 몽고DB key값 바인딩.
const { auth } = require('./middleware/auth');
const { User } = require("./models/User");

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://myeonghunLee:dnfntk1%23%23@boilerplate.6p5ug.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDb Connected...'))
  .catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/api/hello', (req, res) => {
  res.send('하이~')
})

app.post('/api/users/register', (req, res) => {

    // 회원가입 할 때 필요한 정보들을 client에서 가져오면 그것들을 DB에 넣어준다.
    const user = new User(req.body)
  
    user.save((err, userInfo) => {
      if(err) return res.json({ success: false, err})
      return res.status(200).json({ success: true})
    })
  })

app.post('/api/users/login', (req, res) => {

  console.log('ping')
  // 요청된 이메일 주소를 DB에서 검색.
  User.findOne({ email: req.body.email }, (err, user) => {

    console.log('user', user)
    if(!user) {
      return res.json({
        loginSuccess: false,
        message: "존재하지 않는 이메일입니다."
      })
    }
  

  // 요청된 이메일이 DB에 있다면 -> 비밀번호도 동일한지 확인.
  user.comparePassword(req.body.password, (err, isMatch) => {
    if(!isMatch)
      return res.json({ loginSuccess: false, message: "비밀번호가 다릅니다."})

      // 비밀번호가 일치하면 토큰 생성.
      user.generateToken((err, user) => {
        if(err) return res.status(400).send(err);

        // 토큰을 어디에 저장? -> 쿠키/로컬스토리지
        res.cookie("x_auth", user.token)
        .status(200)
        .json({ loginSuccess: true, userId: user._id })
      })
    })
  })
})

// role 0 -> 일반 유저
// role 1 -> admin
// role 2 -> 특정 부서 admin
app.get('/api/users/auth', auth, (req, res) => {
  
  // 여기까지 middleware를 통과해 왔다 -> Authentication이 true.
  res. status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})

app.get('/api/users/logout', auth, (req, res) => {

  User.findOneAndUpdate({ _id: req.user._id },
    { token: "" }
    , (err, user) => {
      if(err) return res.json({ success: false, err });
      return res.status(200).send({
        success: true
      })
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))