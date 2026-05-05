const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const Datastore = require("@seald-io/nedb");

const app = express();

const db = {
    users: new Datastore({ filename: "users.db", autoload: true }),
    archive: new Datastore({ filename: "archive.db", autoload: true }),
};

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        store: new FileStore({ path: "./sessions", retries: 0 }),
        secret: "personality-secret-key",
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 24 * 60 * 60 * 1000 },
    }),
);

const primaryTypes = [
    "calm",
    "chaotic",
    "direct",
    "curious",
    "analytical",
    "playful",
];
const secondaryTypes = [
    "impulsive",
    "hesitant",
    "focused",
    "explorer",
    "efficient",
    "overwhelmed",
    "wandering",
    "precise",
    "erratic",
    "rhythmic",
    "engaged",
    "skimming",
    "revisiting",
    "deep",
];

const getFeedForPersonality = (type) => {
    const feeds = {
        calm: [
            {
                type: "quote",
                content:
                    "Stillness is not the absence of movement,\nbut the presence of yourself.",
                attribution: null,
            },
            {
                type: "image",
                src: "/images/calm-forest.jpg",
                alt: "A calm lake bordered by dense green forest with misty hills in the background.",
                caption: "where thoughts settle",
            },
            {
                type: "breathe",
                label: "Begin Breathing Exercise",
                duration: 4,
            },
            {
                type: "text",
                content: "This space adapts to how you think — not just what you chose. You bring the quiet with you.",
            },
            {
                type: "palette",
                colors: ["#a8d8c8", "#c8b8e8", "#f0e6d3", "#b8d4e8", "#d4e8d4"],
                label: "Your Color Mood",
            },
            {
                type: "image",
                src: "/images/calm-lake.jpg",
                alt: "A lake at sunset surrounded by green hills and distant snow-capped mountains.",
                caption: "stillness speaks",
            },
            {
                type: "expand",
                label: "Open a reflection",
                expandContent:
                    "What would it feel like to need nothing right now? Sit with that for a moment. Notice what loosens.",
            },
            {
                type: "text",
                content: "Slow things are not slow.\nThey are thorough.",
            },
            {
                type: "image",
                src: "/images/calm-garden.jpg",
                alt: "Raked gravel forming concentric circles and straight lines in a Zen garden.",
                caption: "the art of arrangement",
            },
        ],

        chaotic: [
            {
                type: "glitch-title",
                content: "YOU ARE EVERYWHERE",
            },
            {
                type: "image",
                src: "/images/chaos-neon.jpg",
                alt: "A person walking on a wet city street at night with colorful neon reflections on the pavement.",
                caption: null,
            },
            {
                type: "text",
                content: "Order is just chaos\nwaiting to be honest.",
            },
            {
                type: "chaos-counter",
                label: "CHAOS LEVEL",
                startValue: 0,
            },
            {
                type: "image",
                src: "/images/chaos-lines.jpg",
                alt: "Multicolored light trails forming an abstract pattern on a black background.",
                caption: null,
            },
            {
                type: "ticker",
                content:
                    "MAKE NOISE · BREAK PATTERNS · RESIST STILLNESS · CONTRADICT YOURSELF · MOVE FAST · LEAVE MARKS · REPEAT · ",
            },
            {
                type: "scramble",
                label: "SCRAMBLE TEXT",
                content: "You think in collisions not conclusions",
            },
            {
                type: "image",
                src: "/images/chaos-collage.jpg",
                alt: "A wall densely covered with colorful stickers, logos, graffiti, text, and symbols, including cannabis leaves and pop culture references.",
                caption: null,
            },
            {
                type: "text",
                content: "There is no center.\nThat is the point.",
            },
            {
                type: "interactive",
                label: "DETONATE",
                action: "chaosDetonate",
            },
        ],

        direct: [
            {
                type: "direct-header",
                status: "OPERATIONAL",
                uptime: "100%",
            },
            {
                type: "checklist",
                items: [
                    "Identify the objective clearly",
                    "Remove all unnecessary steps",
                    "Execute without hesitation",
                    "Review and iterate once",
                ],
            },
            {
                type: "text",
                content:
                    "Clarity removes friction.\nFriction removes momentum.\nMomentum is everything.",
            },
            {
                type: "image",
                src: "/images/direct-minimal.jpg",
                alt: "A white cube and potted green plant in a minimalist white room, with a window casting a shadow of a person.",
                caption: "Form follows function.",
            },
            {
                type: "direct-stats",
                stats: [
                    { label: "TYPE", value: "DIRECT" },
                    { label: "CLARITY", value: "∞" },
                    { label: "NOISE", value: "0" },
                ],
            },
            {
                type: "text",
                content:
                    "Every unnecessary element removed\nis a decision made.",
            },
            {
                type: "image",
                src: "/images/direct-arch.jpg",
                alt: "A woman walking down wide steps in a modern building with triangular skylights and concrete columns.",
                caption: "Structure as intention.",
            },
            {
                type: "interactive",
                label: "Optimize View",
                action: "optimizeView",
            },
        ],

        curious: [
            {
                type: "quote",
                content:
                    "The important thing is not to stop questioning.\nCuriosity has its own reason for existing.",
                attribution: "— Albert Einstein",
            },
            {
                type: "hidden",
                label: "◈ Something is hidden here",
                revealContent:
                    "You looked. Of course you did. That is what you do — you cannot help but look deeper.",
            },
            {
                type: "image",
                src: "/images/curious-library.jpg",
                alt: "An ornate baroque library with tall bookshelves, spiral columns, a painted ceiling, and globes on stands.",
                caption: "the archive of everything",
            },
            {
                type: "text",
                content: "Every answer is just\na better question in disguise.",
            },
            {
                type: "reveal-question",
                label: "Reveal a question",
                questions: [
                    "What existed before language named it?",
                    "Can a map ever contain itself?",
                    "Is the universe remembering itself through you?",
                    "What does color look like to a blind mathematician?",
                    "If you could unlearn one thing, what would it reveal?",
                    "Where does a thought go when you stop thinking it?",
                    "What is the shape of a word before it becomes sound?",
                ],
            },
            {
                type: "image",
                src: "/images/curious-ocean.jpg",
                alt: "Bioluminescent jellyfish glowing in dark blue water.",
                caption: "depth has no ceiling",
            },
            {
                type: "text",
                content:
                    "You don't follow paths.\nYou notice where no path has been.",
            },
            {
                type: "image",
                src: "/images/curious-stars.jpg",
                alt: "The Milky Way and stars visible in a night sky framed by silhouettes of trees.",
                caption: "the sky keeps records",
            },
        ],

        analytical: [
            {
                type: "terminal-log",
                lines: [
                    "> SYSTEM: personality_engine v2.1",
                    "> LOADING: behavioral_dataset...",
                    "> CURSOR_EVENTS: analyzed",
                    "> QUIZ_RESPONSES: processed",
                    "> PRIMARY_TYPE: analytical",
                    "> CONFIDENCE: 94.3%",
                    "> STATUS: COMPLETE ✓",
                ],
            },
            {
                type: "score-chart",
                label: "// score_distribution.dat",
            },
            {
                type: "stat-row",
                stats: [
                    { label: "DATA_POINTS", value: "247" },
                    { label: "VARIABLES", value: "20" },
                    { label: "CONFIDENCE", value: "94.3%" },
                ],
            },
            {
                type: "text",
                content: "// Pattern recognition is not a skill.\n// It is a compulsion.\n// You cannot turn it off.",
            },
            {
                type: "image",
                src: "/images/analytical-circuit.jpg",
                alt: "Close-up of a green circuit board with electronic components and gold and white circuitry.",
                caption: "// every connection is intentional",
            },
            {
                type: "interactive",
                label: "> run_analysis.exe",
                action: "runFullAnalysis",
            },
            {
                type: "image",
                src: "/images/analytical-network.jpg",
                alt: "A glowing blue eye-like structure with branching, nerve-like patterns on a black background.",
                caption: "// structure reveals itself",
            },
            {
                type: "text",
                content: "// The map is not the territory,\n// but a good map is indispensable.\n// You build good maps.",
            },
        ],

        playful: [
            {
                type: "confetti-hero",
                label: "🎉 Make it Rain!",
                subtitle: "Welcome back, sunshine. Let's play.",
            },
            {
                type: "image",
                src: "/images/playful-balloons.jpg",
                alt: "Colorful inflatable balloons shaped like flowers, animals, and food hang from the ceiling of a glass-domed atrium with brick walls and natural light.",
                caption: "let it all go!",
            },
            {
                type: "emoji-vote",
                label: "Pick your vibe today:",
                options: [
                    { emoji: "🌈", label: "rainbow" },
                    { emoji: "🎪", label: "circus" },
                    { emoji: "🦄", label: "magic" },
                    { emoji: "🎭", label: "drama" },
                ],
            },
            {
                type: "quote",
                content: "Life is more fun if you play games.",
                attribution: "— Roald Dahl",
            },
            {
                type: "image",
                src: "/images/playful-carnival.jpg",
                alt: "A brightly lit carousel with decorative figures under a canopy of string lights at night.",
                caption: "the world is a funhouse",
            },
            {
                type: "bounce-text",
                content: "You make things more fun just by being in them.",
            },
            {
                type: "spin-wheel",
                label: "Spin for a Surprise!",
                options: [
                    "⭐ You shine today",
                    "🎁 Something good is coming",
                    "🦋 Transform one thing",
                    "🎵 Dance right now",
                    "🌟 Share joy with someone",
                    "🎨 Make something beautiful",
                ],
            },
            {
                type: "image",
                src: "/images/playful-candy.jpg",
                alt: "Assorted gummy candies, including bears, worms, and rainbow-striped pieces, on a light purple background.",
                caption: "choose your flavor",
            },
            {
                type: "text",
                content: "Rules are the training wheels\nyou forgot to take off.",
            },
        ],
    };

    return feeds[type] ?? feeds.calm;
};

const getEmptyScores = () =>
    Object.fromEntries([...primaryTypes, ...secondaryTypes].map((t) => [t, 0]));

const calculateScores = (quizAnswers, cursorData) => {
    const allScores = getEmptyScores();

    if (quizAnswers) {
        quizAnswers.forEach((answerTypes) => {
            if (!Array.isArray(answerTypes)) return;
            const weight = 1 / answerTypes.length;
            answerTypes.forEach((type) => {
                if (allScores[type] !== undefined) allScores[type] += weight;
            });
        });
    }

    if (cursorData && cursorData.length > 1) {
        let distance = 0;
        const clicks = cursorData.filter((e) => e.eventType === "click").length;
        const duration =
            (cursorData[cursorData.length - 1].timestamp -
                cursorData[0].timestamp) /
            1000;
        for (let i = 1; i < cursorData.length; i++) {
            distance += Math.sqrt(
                Math.pow(cursorData[i].x - cursorData[i - 1].x, 2) +
                    Math.pow(cursorData[i].y - cursorData[i - 1].y, 2),
            );
        }
        const speed = distance / (duration || 1);

        if (speed > 600)                        allScores.chaotic     += 2;
        if (speed < 150)                        allScores.calm        += 2;
        if (clicks > 12)                        allScores.chaotic     += 3;
        if (distance < 800)                     allScores.direct      += 2;
        if (duration > 45 && speed < 300)       allScores.analytical  += 3;
        if (distance > 2500)                    allScores.curious     += 3;
        if (clicks > 6 && speed > 300)          allScores.playful     += 2;

        if (speed > 600)                        allScores.impulsive   += 3;
        if (speed < 150 && clicks < 4)          allScores.hesitant    += 3;
        if (distance < 800 && duration > 20)    allScores.focused     += 3;
        if (distance > 2500)                    allScores.explorer    += 3;
        if (distance < 800)                     allScores.efficient   += 3;
        if (clicks > 15)                      { allScores.overwhelmed += 3; allScores.erratic += 2; }
        if (distance > 3000 && speed < 300)     allScores.wandering   += 3;
        if (speed > 150 && speed < 250 && distance < 1500) allScores.precise += 3;
        if (clicks > 12)                        allScores.erratic     += 2;
        if (speed > 200 && speed < 400 && duration > 30)   allScores.rhythmic += 3;
        if (duration > 60 && distance > 1500)   allScores.engaged     += 3;
        if (speed > 500 && duration < 20)       allScores.skimming    += 3;
        if (duration > 80)                      allScores.deep        += 3;
    }

    const primaryScores = Object.fromEntries(
        primaryTypes.map((t) => [t, allScores[t]]),
    );
    const primaryPersonality = Object.keys(primaryScores).reduce((a, b) =>
        primaryScores[a] >= primaryScores[b] ? a : b,
    );

    const secondaryTraits = secondaryTypes
        .map((t) => ({ type: t, score: allScores[t] }))
        .filter((e) => e.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map((e) => e.type);

    return { allScores, primaryPersonality, secondaryTraits };
};

app.get("/", (req, res) => res.render("landing"));
app.get("/quiz", (req, res) => res.render("quiz"));

app.post("/quiz", async (req, res) => {
    const { allScores, primaryPersonality, secondaryTraits } = calculateScores(
        req.body.answers,
        req.session.cursorData || [],
    );

    req.session.quizAnswers        = req.body.answers;
    req.session.allScores          = allScores;
    req.session.primaryPersonality = primaryPersonality;
    req.session.secondaryTraits    = secondaryTraits;
    req.session.finalPersonality   = primaryPersonality;

    await db.users.insert({
        sessionId: req.sessionID,
        primaryPersonality,
        secondaryTraits,
        allScores,
        timestamp: new Date(),
    });

    req.session.save(() => res.redirect("/hub"));
});

app.post("/track", (req, res) => {
    if (!req.session.cursorData) req.session.cursorData = [];
    if (req.body.events) req.session.cursorData.push(...req.body.events);
    res.sendStatus(200);
});

app.get("/hub", (req, res) => {
    if (!req.session.primaryPersonality) return res.redirect("/quiz");
    res.render("hub", {
        personality:    req.session.primaryPersonality,
        secondaryTraits: req.session.secondaryTraits || [],
        allScores:      req.session.allScores || {},
        feed:           getFeedForPersonality(req.session.primaryPersonality),
        page:           "hub",
    });
});

app.get("/profile", (req, res) => {
    if (!req.session.primaryPersonality) return res.redirect("/");
    res.render("profile", {
        personality:    req.session.primaryPersonality,
        secondaryTraits: req.session.secondaryTraits || [],
        allScores:      req.session.allScores || {},
        data:           req.session.cursorData || [],
        page:           "profile",
    });
});

app.post("/share", async (req, res) => {
    const shareId = `share_${Date.now()}`;
    await db.archive.insert({
        id:             shareId,
        personality:    req.session.primaryPersonality,
        secondaryTraits: req.session.secondaryTraits || [],
        cursorData:     req.session.cursorData || [],
        timestamp:      new Date(),
    });
    res.json({ url: `/archive/${shareId}` });
});

app.get("/archive", async (req, res) => {
    const entries = await db.archive.find({});
    entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.render("archive", { entries, page: "archive" });
});

app.get("/archive/:id", async (req, res) => {
    const entry = await db.archive.findOne({ id: req.params.id });
    if (!entry) return res.status(404).send("Not Found");
    res.render("archive_detail", { entry });
});

app.post("/reset", (req, res) => req.session.destroy(() => res.redirect("/")));

app.listen(4011, () => console.log(`Server: http://localhost:4011`));