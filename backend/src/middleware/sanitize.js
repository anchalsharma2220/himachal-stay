// Strips MongoDB operator keys ($gt, $ne ...) and dotted keys from user input (NoSQL-injection guard)
const clean = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) delete obj[key];
    else clean(obj[key]);
  }
  return obj;
};
module.exports = (req, _res, next) => { clean(req.body); clean(req.query); clean(req.params); next(); };
