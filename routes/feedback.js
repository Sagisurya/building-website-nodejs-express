const express = require('express');

const { check, validationResult } = require('express-validator');

const router = express.Router();

const validations = [
  check('Name').trim().isLength({ min: 3 }).escape().withMessage('A name is required'),
  check('Email').trim().isEmail().normalizeEmail().withMessage('A valid email is required'),
  check('title').trim().isLength({ min: 3 }).escape().withMessage('A title is required'),
  check('message').trim().isLength({ min: 5 }).escape().withMessage('A message is required'),
];

module.exports = (params) => {
  const { feedbackService } = params;
  router.get('/', async (request, response) => {
    try {
      const feedback = await feedbackService.getList();

      const errors = request.session.feedback ? request.session.feedback.errors : false;

      const successMessage = request.session.feedback ? request.session.feedback.success : false;

      request.session.feedback = {};
      return response.render('layout', {
        pageTitle: 'Feedback',
        template: 'feedback',
        feedback,
        errors,
        successMessage,
      });
    } catch (err) {
      return next(err);
    }
  });

  router.post('/', validations, async (request, response, next) => {
    try {
      const errors = validationResult(request);

      if (!errors.isEmpty()) {
        request.session.feedback = {
          errors: errors.array(),
        };
        return response.redirect('/feedback');
      }
      const { Name, Email, title, message } = request.body;
      await feedbackService.addEntry(Name, Email, title, message);
      request.session.feedback = {
        success: 'The feedback was successfully stored',
      };
      return response.redirect('/feedback');
    } catch (err) {
      return next(err);
    }
  });

  router.post('/api', validations, async (request, response, next) => {
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        return response.json({
          errors: errors.array(),
        });
      }
      const { Name, Email, title, message } = request.body;
      await feedbackService.addEntry(Name, Email, title, message);
      const feedback = await feedbackService.getList();
      const successMessage = 'Thanks for the feedback';
      return response.json({ feedback, successMessage });
    } catch (err) {
      return next(err);
    }
  });

  return router;
};
