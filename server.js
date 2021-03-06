const express = require('express');
const path = require('path');

const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');

const FeedbackService = require('./services/FeedbackService');
const SpeakersService = require('./services/SpeakerService');
const routes = require('./routes');
const app = express();

const port = 3001;

const feedbackService = new FeedbackService('./data/feedback.json');
const speakersService = new SpeakersService('./data/speakers.json');

app.set('trust proxy', 1);
app.use(
  cookieSession({
    name: 'session',
    keys: ['sfsdfsdcvsd', 'sdcsdcsdcw324r'],
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.locals.siteName = 'ROUX Meetups';

app.use(express.static(path.join(__dirname, './static')));

app.use(async (request, response, next) => {
  try {
    const names = await speakersService.getNames();
    response.locals.speakerNames = names;
    return next();
  } catch (err) {
    return next(err);
  }
});

app.use('/', routes({ feedbackService, speakersService }));

app.listen(port, () => {
  console.log(`Express server listening on port ${port}!`);
});
