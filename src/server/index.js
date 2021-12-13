require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");
const roverIntro = require("./assets/rover-intro.json");

const app = express();
const port = 3000;
const marsRoversApiUrl = "https://api.nasa.gov/mars-photos/api/v1";
const apiKeyRouteParm = `api_key=${process.env.API_KEY}`;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", express.static(path.join(__dirname, "../public")));

/**
 * Get rover info based on its name
 */
app.get("/marsRoverPics/:roverName", async (req, res) => {
  // If api key is not defined, send unauth response
  if (process.env.API_KEY === undefined) {
    res.status(401);
    res.send({ error: "Not authorized" });
  } else {
    const roverName = req.params.roverName;
    // Get Manifest
    const getManifest = async function () {
      try {
        const manifest = await fetch(
          `${marsRoversApiUrl}/manifests/${roverName}?${apiKeyRouteParm}`
        );
        return await manifest.json();
      } catch (err) {
        throw err;
      }
    };

    try {
      const roverManifest = await getManifest();
      const maxDate = roverManifest.photo_manifest.max_date;
      const roverApiResponse = await fetch(
        `${marsRoversApiUrl}/rovers/${roverName}/photos?earth_date=${maxDate}&${apiKeyRouteParm}`
      );
      const roverApiJson = await roverApiResponse.json();
      // Rover object
      const rover = {
        ...roverIntro[roverName.toLowerCase()],
        photoUrls: [],
      };
      // Add image src urls to the response
      rover.photoUrls = roverApiJson.photos.map((roverInfo) => {
        return {
          src: roverInfo.img_src,
          cam: roverInfo.camera.full_name,
          date: roverInfo.earth_date,
        };
      });
      // send the response
      res.send(rover);
    } catch (err) {
      throw err;
    }
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
