// stops us from writing try-catch every two lines. 
// just wraps the route handler and sends errors to express.
// 'fn' stands for 'function'
/*
  Without this, every controller looks like this:
  exports.doStuff = async (req, res, next) => {
      try {
          await model.save();
          res.send('ok');
      } catch (err) {
          next(err); // tedious!
      }
  };

  With this, it's just:
  exports.doStuff = asyncHandler(async (req, res) => {
      await model.save();
      res.send('ok'); // handler catches errors automatically
  });
*/

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
