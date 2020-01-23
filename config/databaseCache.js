const CacheHandler = require("../util/classes/CacheHandler");
const cacheTime = parseInt(process.env.MYSQL_CACHE_TIME) * 1000;
module.exports = new CacheHandler(cacheTime);