const { getDefaultConfig } = require("expo/metro-config");

/** Keep Metro on Expo defaults to avoid drift. */
module.exports = getDefaultConfig(__dirname);
