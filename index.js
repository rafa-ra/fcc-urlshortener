require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient } = require("mongodb");
const dns = require("dns");
const urlParser = require("url");

const client = new MongoClient(process.env.DB_URL);
const db = client.db("mongodb-mongoose");
const urls = db.collection("freecodecamp-urlshortener");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.post("/api/shorturl", function (req, res) {
  const url = req.body.url;
  const dnsLookup = dns.lookup(
    urlParser.parse(url).hostname,
    async (err, address) => {
      if (!address) {
        res.json({ error: "Invalid URL" });
      } else {
        const urlCount = await urls.countDocuments({});
        const urlDocument = {
          url,
          shortUrl: urlCount,
        };
        const result = await urls.insertOne(urlDocument);
        console.log(result);
        res.json({ original_url: url, short_url: urlCount });
      }
    }
  );
  console.log(req.body);
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  const shortUrl = req.params.short_url;

  const urlDocument = await urls.findOne({ shortUrl: +shortUrl });

  res.redirect(urlDocument.url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
