import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from HTTP backend!");
}); 

app.listen(3000, () => {
  console.log("HTTP server is running on port 3000");
});