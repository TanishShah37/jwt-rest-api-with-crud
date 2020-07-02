const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/config');
const util = require('util')
const colors = require('colors')
const app = express();
const morgan = require('morgan');
const authController = require('./controllers/authController')
const agencyController = require('./controllers/agencyController')
const clientController = require('./controllers/clientController')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');

const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json'); '';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cookieParser());
app.use(compress());

app.use(helmet());


app.use(
    cors({
        exposedHeaders: ['x-auth-header'],
    }),
);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
// app.use('/api/v1', SwaggerAPIRouter);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin,Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'POST,GET,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

mongoose.Promise = Promise;

mongoose.connect(config.mongo.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,   
}).then(() => {
    util.log(colors.green("Successfully Connected to MongoDB"));
});
mongoose.connection.on('error', (err) => {
    const error = new Error(`unable to connect to db: ${config.mongo.uri} with error: ${error}`);
    util.log(colors.red(error));
});

// app.use(morgan('dev'));

app.use('/auth', authController);
app.use('/agency', agencyController);
app.use('/client', clientController);
// app.use('/', router);

app.use((req, res, next) => {
    const error = new Error('Wrong Path');
    error.status = 404;
    next(error);
});


app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

const port = process.env.PORT || 4001;


app.listen(port, () => {
    util.log(colors.green(`API Server started at Port: ${port}`));
});