// file system
const { stat } = require('fs');
const process = require('process');
const { resolve } = require('path');
const { TwingEnvironment, TwingLoaderFilesystem, TwingFunction} = require('twing');
// modules
const twingLoader = new TwingLoaderFilesystem();
const twing = new TwingEnvironment(twingLoader, {
  'cache': false,
});
twing.extendFilter = twing.addFilter;
twing.extendFunction = twing.addFunction;

/**
 * Retrieves options from the configuration file
 * @returns {object}
 */
 function retrieveOptions() {
  const cwd = process.cwd();
  const file = resolve(cwd, 'twig.config.js');

  stat(file, function(err, stat) {
    if (err && err.code === 'ENOENT') return false;

    if (err === null) {
        try {
          return require(file);
        } catch (e) {
          console.error(`Require ${file} faild:\n`, e);
        }
    } else {
        console.error('File system error: ', err.code);
    }
  });

  return {};
}

/**
 * It handles Twig configuration and extension
 * @param {object} extensions
 */
function configureTwig({ functions = {}, filters = {} } = {}) {
  const options = retrieveOptions();
  if (options.templatePath) {
    loader.addPath(options.templatePath);
  }
  if (options.namespaces) {
    Object.entries(options.namespaces).forEach(([key, value]) => {
      twingLoader.addPath(value, key);
    });
  }
  Object.entries(filters).forEach(([key, fn]) => {
    const twingFilter = new TwingFilter(key, value);
    twing.addFilter(twingFilter);
  });
  Object.entries(functions).forEach(([key, fn]) => {
    const twingFunction = new TwingFunction(key, value);
    twing.addFunction(twingFunction);
  });
}

/**
 * It handles the conversion from twig to html
 * @param {string} template The twig template filepath
 * @param {object} context The data to be injected in the template
 * @param {object} settings The twig settings
 * @returns {Promise}
 */
function renderTemplate(template, context = {}, settings = {}) {
  return new Promise((resolve, reject) => {
    twing.render(template, {...context, settings}).then(html => {
      resolve(html);
    });
  });
}

module.exports.retrieveOptions = retrieveOptions;
module.exports.configureTwig = configureTwig;
module.exports.renderTemplate = renderTemplate;
module.exports.twing = twing;
module.exports.loader = twingLoader;
