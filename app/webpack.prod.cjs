const { merge } = require("webpack-merge");
const common = require("./webpack.common.cjs");

module.exports = (env) => {
  return merge(common(env), {
    mode: "production",
  });
};
