const express = require('express');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000; //when this project deployed to Hiroku, it's going to ge the port || locally 5000

const app = express();

//Connect Database
connectDB();

//Init Middleware
app.use(express.json({ extended: false })); //allow us to get the data from request body

app.get('/', (req, res) => res.send('APP running '));

//Define Routes

app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/auth', require('./routes/api/auth'));

app.listen(PORT, () => console.log(`server started on port ${PORT}`));
