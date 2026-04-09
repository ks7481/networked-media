const express = require("express");
const nedb = require("@seald-io/nedb");

const app = express();

const songsDB = new nedb({ filename: "songs.db", autoload: true });
const repliesDB = new nedb({ filename: "replies.db", autoload: true });
const stateDB = new nedb({ filename: "state.db", autoload: true });

app.use(express.json());

// songs
app.get("/api/songs", (req, res) => {
	songsDB.find({}, (err, data) => res.json(data));
});

app.post("/api/songs/add", (req, res) => {
	const { song } = req.body;

	songsDB.findOne({ song }, (err, exists) => {
		if (!exists) {
			songsDB.insert({ song }, () => res.sendStatus(204));
		}
		else {
			res.sendStatus(200);
		}
	});
});

// replies
app.get("/api/replies", (req, res) => {
	repliesDB.find({}, (err, data) => res.json(data));
});

app.post("/api/replies/add", (req, res) => {
	const { id } = req.body;

	repliesDB.findOne({ id }, (err, exists) => {
		if (!exists) {
			repliesDB.insert({ id }, () => res.sendStatus(204));
		}
		else {
			res.sendStatus(200);
		}
	});
});

// state
app.get("/api/state", (req, res) => {
	stateDB.findOne({ type: "state" }, (err, data) => {
		if (!data) {
			const newState = {
				type: "state",
				postsToday: 0,
				lastReset: new Date().toDateString(),
			};
			stateDB.insert(newState, () => res.json(newState));
		}
		else {
			const today = new Date().toDateString();

			if (data.lastReset !== today) {
				data.postsToday = 0;
				data.lastReset = today;
				stateDB.update({ type: "state" }, data);
			}

			res.json(data);
		}
	});
});

app.post("/api/state/update", (req, res) => {
	stateDB.update({ type: "state" }, req.body, {}, () => res.sendStatus(204));
});

app.listen(6006, () => {
	console.log("server running at http://localhost:6006");
});