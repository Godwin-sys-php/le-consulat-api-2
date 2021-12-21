const limit = require("express-rate-limit");
/**
 * @param  {Number} numberOfCall Le nombre d'appel par ip
 * @param  {Number} minute Le nombre de minute
 */
module.exports = (numberOfCall, minute) => {
  return limit({
    windowMs: parseInt(minute) * 60 * 1000,
    max: numberOfCall,
    message: {
      toManyRequest: true,
      numberOfCall: numberOfCall,
      minute: minute
    }
  });
}