const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withPrivacyManifest = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const src = path.join(__dirname, 'PrivacyInfo.xcprivacy');
      const dest = path.join(config.modRequest.platformProjectRoot, 'PrivacyInfo.xcprivacy');
      fs.copyFileSync(src, dest);
      return config;
    },
  ]);
};

module.exports = withPrivacyManifest;
