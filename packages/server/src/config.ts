/**
 * This exports a map that holds the global config.
 */

const config = {
  server: {
    port: 8080,
    host: "localhost"
  },
  passwordHashing: {
    saltRounds: 10
  }
};

export default config;
