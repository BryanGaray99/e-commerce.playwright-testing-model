const common = [
  'src/features/ecommerce_features/**/*.feature',
  '--require-module ts-node/register',
  '--require src/steps/**/*.ts',
  '--require src/steps/ecommerce_steps/**/*.ts',
  '--format progress-bar',
  '--format json:test-results/cucumber-report.json',
  '--format html:test-results/cucumber-report.html',
  '--publish-quiet'
].join(' ');

module.exports = {
  default: common,
  smoke: common + ' --tags "@smoke"',
  regression: common + ' --tags "@regression"',
  products: common + ' --tags "@products"',
  users: common + ' --tags "@users"',
  orders: common + ' --tags "@orders"',
  categories: common + ' --tags "@categories"',
  cart: common + ' --tags "@cart"'
};