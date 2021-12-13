let store = Immutable.fromJS({
  launch: "",
  landing: "",
  launchVehicle: "",
  landingLocation: "",
  mission: "",
  active: false,
  photoUrls: [],
});

// HTML elements to interact with
const getById = (id) => document.getElementById(id);
const root = getById("root");
const curiosityRover = getById("curiosity");
const spiritRover = getById("spirit");
const opportunityRover = getById("opportunity");
const marsInfoHtml = root.innerHTML;
const marsInfo = getById("marsInfo");
const appLogo = getById("logo");

/**
 * @param {HTMLElement} marsNavLink
 * @param {*} marsHtml
 */
const MarsInfo = (marsHtml, marsNavLink) => {
  return () => {
    setAsActive(marsNavLink);
    root.innerHTML = marsHtml;
  }
}

/**
 * Create Rover Intro Html
 * @param {Immutable.Collection} store
 * @param {string} roverName
 * @returns
 */
const RoverIntro = (store, roverName) => {
  return `
    <div class="row" id="intro">
      <div class="col-sm-4">
          <img src="assets/images/${roverName.toLowerCase()}-thumbnail.jpeg" class="img-thumbnail">
      </div>
      <div class="col-sm-8">
          <div class="row">
              <div class="col">
                  <h3>Key facts about NASA's ${roverName} Rover</h3>
              </div>
          </div>
          <div class="row">
              <div class="col">
                  <!-- <div class=row> -->
                      <p class="fw-bold">
                          Launch date:
                          <span class="fw-light">
                              ${store.get("launch")}
                          </span>
                      </p>
                      <p class="fw-bold">
                          Landing date:
                          <span class="fw-light">
                              ${store.get("landing")}
                          </span>
                      </p>
                      <p class="fw-bold">
                          Landing site:
                          <span class="fw-light">
                              ${store.get("landingLocation")}
                          </span>
                      </p>
                      <p class="fw-bold">
                          Opertational status:
                          <span class="fw-light">
                              ${store.get("active") ? "Operational" : "Not operational"}
                          </span>
                      </p>
                      <p class="fw-bold">
                          Mission objective:
                          <span class="fw-light">
                            ${store.get("mission")}
                          </span>
                      </p>
                  <!-- </div> -->
              </div>
          </div>
      </div>
  </div>
     `;
};

/**
 * Creates rover intro header
 * @param {string} roverName
 * @returns
 */
const RoverPhotoHeader = (roverName) => {
  return `
    <div class="row justify-content-center mt-3 mb-2">
      <div class="col-sm-6">
          <h3>Latest image(s) taken by ${roverName}</h3>
      </div>
    </div>
  `;
};

/**
 * @description - Create footer section of the app
 * @returns {void}
 */
const Footer = () => `
  <div class="row m-4">
    <div class="col-12">
        <p class="text-center bg-secondary text-white">
          Images and content are taken from NASA and may be subject to NASA's
          <a href="https://www.nasa.gov/multimedia/guidelines/index.html" class="text-white" target="_blank">
            Media guidelines
          </a>
        </p>
    </div>
  </div>
`;

/**
 * @description - Creates Rover carousel
 * @param {Immutable.List} photos
 * @returns {string} - Returns HTML code for the rover photo carousel
 */
const RoverPhotos = (photos) => {
  const numOfPhotos = photos.toArray().length;
  if(numOfPhotos < 1) {
    return `<h4 class="bg-secondary text-center text-warning">No photos found</h4>`
  }
  // Create carousel items using rover photos
  const photoHtmlTags = photos.toArray().map(
    (p, i) => {
      const imgText = `This image was taken on ${p.date} by ${p.cam}`;
      return `
        <div class="carousel-item${i === 0 ? " active" : ""} height="400">
          <img src="${p.src}" class="d-block w-100" alt="${imgText}">
          <div class="carousel-caption d-md-block bg-black bg-opacity-25">
              <h5>Image: ${i + 1} of ${numOfPhotos}</h5>
              <p>${imgText}</p>
          </div>
        </div>`
    }
  );
  // Rover carousel div
  let carousel = `
      <div class="row justify-content-center mt-3 mb-2">
        <div class="cos-sm-4 col-md-6">
          <div id="roverPhotoCarousel" class="carousel slide justify-content-center" data-bs-ride="carousel" data-bs-interval="false">
            <<carousel>>
            <<controls>>
          </div>
        </div>
      </div>
    `;

  const carouselControls = `
      <button class="carousel-control-prev" type="button" data-bs-target="#roverPhotoCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#roverPhotoCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    `;
  const carouselInner = `
    <div class="carousel-inner">
      ${photoHtmlTags.join("\n")}
    </div>
    `;
  // Add rover photo carousel items
  carousel = carousel.replace("<<carousel>>", carouselInner);
  // If there are more than one photos, add prev and next arrows
  carousel =
    photoHtmlTags.length > 1
      ? carousel.replace("<<controls>>", carouselControls)
      : (carousel = carousel.replace("<<controls>>", ""));

  return carousel;
};

const spinner = () => `
  <div class="d-flex justify-content-center">
    <div class="spinner-border text-warning spin" role="status">
    </div>
  </div>
  `;

/**
 * @description - Collapses toggler button after a rover/home is selected
 * @returns {void}
 */
const CollapseToggler = () => document.querySelector(".navbar .collapse").classList.remove("show");

/**
 * @description - Event listner that would update the page with a given rover
 * @param {HTMLElement} rover - Rover HTML element
 * @param {Immutable.Collection} store - Store
 * @returns {()} - Function that updates the root with rover info
 */
const roverLinkEventLister = (rover, store) => {
  return async () => {
    try {
      setAsActive(rover);
      const roverSelected = rover.innerText;
      root.innerHTML = spinner();
      const roverInfo = await (
        await fetch(`http://localhost:3000/marsRoverPics/${roverSelected}`)
      ).json();
      const storeKeys = store.keySeq().toArray();
      storeKeys.forEach(key => {
        if (Array.isArray(roverInfo[key])) {
          store = store.set(key, Immutable.List(roverInfo[key]));
        } else {
          store = store.set(key, roverInfo[key]);
        }
      })
      console.log("test");
      console.log(store.get("photoUrls", "None"));
      store.getIn(["name"]);
      CollapseToggler();
      root.innerHTML =
        RoverIntro(store, roverSelected) +
        RoverPhotoHeader(roverSelected) +
        RoverPhotos(store.get("photoUrls", "No photos")) +
        Footer();
    } catch (e) {
      root.innerHTML = `<h1 class="text-danger">You're not authorized. Check .env file</h1>`;
    }
  }
};


/**
 * @description - Sets a given nav item as active
 * @param {HTMLElement} el
 */
const setAsActive = (el) => {
  const activeCss = ["active", "text-white"];
  document.querySelector(".nav-link.active").classList.remove("active", "text-white");
  el.classList.add("active", "text-white");
}
// Event listerner for Spirit nav item
spiritRover.addEventListener(
  "click",
  roverLinkEventLister(spiritRover, store)
);

// Event listerner for Opportunity nav item
opportunityRover.addEventListener(
  "click",
  roverLinkEventLister(opportunityRover, store)
);

// Event listerner for Curiosity nav item
curiosityRover.addEventListener(
  "click",
  roverLinkEventLister(curiosityRover, store)
);

// Event listerner for About Mars
marsInfo.addEventListener(
  "click",
  MarsInfo(marsInfoHtml, marsInfo)
);

// Event listerner for nav brand
appLogo.addEventListener(
  "click",
  MarsInfo(marsInfoHtml, marsInfo)
);

