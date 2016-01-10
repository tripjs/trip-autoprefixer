import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import _ from 'lodash';
import micromatch from 'micromatch';
import chalk from 'chalk';
import LazyBuilder from 'lazy-builder';

const defaults = {
  include: '**/*.css',
};

export default function (options) {
  // process options, allowing for variable number of args
  if (_.isString(options)) options = [options];
  if (Array.isArray(options)) {
    options = _.defaults(options, defaults, {browsers: arguments[0]}, arguments[1]);
  }
  else options = _.defaults(options, defaults);

  // configure a postcss processor to reuse on every job
  const plugin = autoprefixer(options);
  const processor = postcss([plugin]);

  // make a filterer
  const included = micromatch.filter(options.include);

  return new LazyBuilder(function (file, contents) {
    if (!included(file)) return contents;

    return processor.process(contents.toString(), {map: true})
      .then(result => {
        for (const warning of result.warnings()) {
          console.warn(chalk.yellow(`trip-autoprefixer: warning for ${file}\n  `) + warning.toString());
        }

        return result.css;
      });
  }).build;
}
