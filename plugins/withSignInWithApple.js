const { withEntitlementsPlist } = require('@expo/config-plugins');

const withSignInWithApple = (config) => {
  return withEntitlementsPlist(config, (c) => {
    c.modResults['com.apple.developer.applesignin'] = ['Default'];
    return c;
  });
};

module.exports = withSignInWithApple;
