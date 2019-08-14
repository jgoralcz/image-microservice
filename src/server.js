const app = require('./app');

const port = 9002;

app.listen(port, () => {
  console.log(`Image microservice running at port ${port}`);
});

// shows where the rejection occured
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

// shows where the rejection occured
process.on('uncaughtException', (err) => {
  console.error(`${(new Date()).toUTCString()} uncaughtException:`, err.message);
  console.error(err.stack);

  // exit the program because it's in an undefined state.
  process.exit(1);
});
