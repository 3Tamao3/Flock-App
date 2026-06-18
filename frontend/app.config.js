require('dotenv').config();

module.exports = {
  expo: {
    name: 'Flock',
    slug: 'flock-app',
    version: '1.0.0',
    platforms: ['ios', 'android'],
    android: {
      package: 'com.anonymous.flock',
      edgeToEdgeEnabled: true,
    },
    plugins: [
      [
        '@rnmapbox/maps',
        { RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOADS_TOKEN },
      ],
    ],
  },
};
