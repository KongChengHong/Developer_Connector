const express = require('express');

const PORT = process.env.PORT || 5000; //when this project deployed to Hiroku, it's going to ge the port || locally 5000

const app = express();

app.listen(PORT, () => console.log(`server started on port ${PORT}`));

app.get('/', (req, res) => res.send('APP running '));
