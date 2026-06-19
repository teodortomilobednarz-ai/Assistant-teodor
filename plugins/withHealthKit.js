const { withEntitlementsPlist, withInfoPlist } = require('@expo/config-plugins');

const withHealthKit = (config) => {
  config = withEntitlementsPlist(config, (c) => {
    c.modResults['com.apple.developer.healthkit'] = true;
    c.modResults['com.apple.developer.healthkit.access'] = [];
    return c;
  });

  config = withInfoPlist(config, (c) => {
    c.modResults['NSHealthShareUsageDescription'] =
      'Nutrascan lit vos pas pour ajuster votre budget calorique quotidien.';
    return c;
  });

  return config;
};

module.exports = withHealthKit;
