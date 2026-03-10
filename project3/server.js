const express = require("express");
const session = require("express-session");
const multer = require("multer");

const app = express();
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "salonSecret",
    resave: false,
    saveUninitialized: true,
  })
);

const upload = multer({ dest: "public/uploads" });

let serviceReviews = [];
let productReviews = [];
let questions = [];

const services = [
  "Frontal Unit Install",
  "Closure Unit Install",
  "Traditional Sew-In",
  "TKT Unit Install",
  "Wash & Style",
];

const products = [
  "Bundles",
  "5x5 Closure Unit",
  "Tosin",
  "Sidi",
  "Brenda",
];

app.use((req, res, next) => {
  req.session.votedService ||= [];
  req.session.votedProduct ||= [];
  next();
});

function checkAgreement(req, res, next) {
  req.session.agreed ? next() : res.redirect("/agreement");
}

function checkAdmin(req, res, next) {
  req.session.admin ? next() : res.redirect("/admin");
}

function averageRating(reviews) {
  if (!reviews.length) return 0;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return (total / reviews.length).toFixed(1);
}

function sortReviews(list, sort) {
  const sorted = [...list];

  if (sort === "oldest") sorted.sort((a, b) => a.id - b.id);
  else if (sort === "highest") sorted.sort((a, b) => b.rating - a.rating);
  else if (sort === "lowest") sorted.sort((a, b) => a.rating - b.rating);
  else sorted.sort((a, b) => b.id - a.id);

  return sorted;
}

function sortForAdmin(list, type) {
  return [...list].sort((a, b) => {
    const aHas = type === "review" ? a.reply : a.answer;
    const bHas = type === "review" ? b.reply : b.answer;

    if (!aHas && bHas) return -1;
    if (aHas && !bHas) return 1;
    return b.id - a.id;
  });
}

function createReview(body, file, category) {
  return {
    id: Date.now(),
    name: body.name,
    rating: Number(body.rating),
    text: body.text,
    image: file ? file.filename : null,
    helpful: 0,
    reply: null,
    category,
  };
}

function voteHelpful(list, sessionList, id) {
  const review = list.find((r) => r.id == id);
  if (review && !sessionList.includes(review.id)) {
    review.helpful++;
    sessionList.push(review.id);
  }
  return review;
}

app.get("/", (req, res) => res.render("home"));

app.get("/agreement", (req, res) => res.render("agreement"));

app.post("/agree", (req, res) => {
  req.session.agreed = true;
  res.redirect("/service-reviews");
});

/* SERVICE REVIEWS */

app.get("/service-reviews", checkAgreement, (req, res) => {
  const sort = req.query.sort || "newest";
  const queryService = req.query.service || "";

  let filtered = queryService
    ? serviceReviews.filter((r) => r.category === queryService)
    : serviceReviews;

  filtered = sortReviews(filtered, sort);

  res.render("service-reviews", {
    reviews: filtered,
    avg: averageRating(filtered),
    sort,
    queryService,
    services,
  });
});

app.post("/service-review", upload.single("image"), (req, res) => {
  serviceReviews.push(createReview(req.body, req.file, req.body.service));
  res.redirect("/service-reviews");
});

app.post("/helpful-service/:id", (req, res) => {
  const review = voteHelpful(
    serviceReviews,
    req.session.votedService,
    req.params.id
  );
  res.json({ helpful: review?.helpful || 0 });
});

/* PRODUCT REVIEWS */

app.get("/product-reviews", checkAgreement, (req, res) => {
  const sort = req.query.sort || "newest";
  const queryProduct = req.query.product || "";

  let filtered = queryProduct
    ? productReviews.filter((r) => r.category === queryProduct)
    : productReviews;

  filtered = sortReviews(filtered, sort);

  res.render("product-reviews", {
    reviews: filtered,
    avg: averageRating(filtered),
    sort,
    queryProduct,
    products,
  });
});

app.post("/product-review", upload.single("image"), (req, res) => {
  productReviews.push(createReview(req.body, req.file, req.body.product));
  res.redirect("/product-reviews");
});

app.post("/helpful-product/:id", (req, res) => {
  const review = voteHelpful(
    productReviews,
    req.session.votedProduct,
    req.params.id
  );
  res.json({ helpful: review?.helpful || 0 });
});

/* Q&A */

app.get("/qa", checkAgreement, (req, res) =>
  res.render("qa", { questions })
);

app.post("/ask", (req, res) => {
  questions.push({
    id: Date.now(),
    name: req.body.name,
    question: req.body.question,
    answer: null,
  });
  res.redirect("/qa");
});

/* ESTIMATE */

app.get("/estimate", checkAgreement, (req, res) =>
  res.render("estimate")
);

/* ADMIN */

app.get("/admin", (req, res) => {
  if (!req.session.admin) return res.render("admin", { login: true });

  res.render("admin", {
    login: false,
    serviceReviews: sortForAdmin(serviceReviews, "review"),
    productReviews: sortForAdmin(productReviews, "review"),
    questions: sortForAdmin(questions, "question"),
  });
});

app.post("/admin-login", (req, res) => {
  if (req.body.password === "klxssic") req.session.admin = true;
  res.redirect("/admin");
});

/* ADMIN ACTIONS */

app.post("/reply-service/:id", checkAdmin, (req, res) => {
  const r = serviceReviews.find((r) => r.id == req.params.id);
  if (r) r.reply = req.body.reply;
  res.redirect("/admin");
});

app.post("/reply-product/:id", checkAdmin, (req, res) => {
  const r = productReviews.find((r) => r.id == req.params.id);
  if (r) r.reply = req.body.reply;
  res.redirect("/admin");
});

app.post("/answer/:id", checkAdmin, (req, res) => {
  const q = questions.find((q) => q.id == req.params.id);
  if (q) q.answer = req.body.answer;
  res.redirect("/admin");
});

function deleteItem(list, id) {
  return list.filter((item) => item.id != id);
}

app.post("/delete-service/:id", checkAdmin, (req, res) => {
  serviceReviews = deleteItem(serviceReviews, req.params.id);
  res.redirect("/admin");
});

app.post("/delete-product/:id", checkAdmin, (req, res) => {
  productReviews = deleteItem(productReviews, req.params.id);
  res.redirect("/admin");
});

app.post("/delete-question/:id", checkAdmin, (req, res) => {
  questions = deleteItem(questions, req.params.id);
  res.redirect("/admin");
});

app.listen(5025, () =>
  console.log("Server running on port 5025")
);