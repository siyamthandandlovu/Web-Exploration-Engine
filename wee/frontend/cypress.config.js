const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: 'awaz45',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here

      require('@cypress/code-coverage/task')(on, config)
      return config;
    },
  },
});
