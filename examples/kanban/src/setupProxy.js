const proxy = require("http-proxy-middleware");
// module.exports = function(app) {
//   app.use(proxy("/auth/google", { target: "http://localhost:5000/" }));
// };

module.exports = function(app) {
  // app.use(proxy("/", { target: "http://localhost:4000" }));
  app.use(proxy("/socket.io", { target: "http://localhost:4000", ws: true }));
};
