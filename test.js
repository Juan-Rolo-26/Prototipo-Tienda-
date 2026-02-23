const http = require("http");

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("TEST OK");
}).listen(PORT, "0.0.0.0", () => {
  console.log("TEST SERVER RUNNING ON", PORT);
});
