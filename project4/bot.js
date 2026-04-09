require("dotenv").config();
const m = require("masto");
const fetch = require("node-fetch");
const jsdom = require("jsdom");

const masto = m.createRestAPIClient({
	url: "https://networked-media.itp.io",
	accessToken: process.env.TOKEN,
});

const stream = m.createStreamingAPIClient({
	accessToken: process.env.TOKEN,
	streamingApiUrl: "wss://networked-media.itp.io",
});

// genres
const GENRES = [
	"rock", "pop", "jazz", "hip-hop", "electronic", "indie", "alternative", "metal", "punk", "blues", "classical", "reggae", "soul", "funk", "disco", "techno", "house", "ambient", "lofi", "country", "rnb", "k-pop", "latin", "afrobeats"
];

// databases
async function getState() {
	const res = await fetch("http://localhost:6006/api/state");
	return await res.json();
}

async function updateState(state) {
	await fetch("http://localhost:6006/api/state/update", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(state),
	});
}

async function hasSong(song) {
	const res = await fetch("http://localhost:6006/api/songs");
	const songs = await res.json();
	return songs.some(s => s.song === song);
}

async function saveSong(song) {
	await fetch("http://localhost:6006/api/songs/add", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ song }),
	});
}

async function hasReplied(id) {
	const res = await fetch("http://localhost:6006/api/replies");
	const replies = await res.json();
	return replies.some(r => r.id === id);
}

async function saveReply(id) {
	await fetch("http://localhost:6006/api/replies/add", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ id }),
	});
}

// last.fm
async function getSong(genre = null) {
	try {
		if (!genre) {
			genre = GENRES[Math.floor(Math.random() * GENRES.length)];
		}

		const url = `http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${genre}&api_key=${process.env.LASTFM_API_KEY}&format=json`;

		const res = await fetch(url);
		const data = await res.json();

		for (let t of data.tracks.track) {
			const song = `${t.name} - ${t.artist.name}`;
			if (!(await hasSong(song))) return song;
		}

		return null;
	} catch (err) {
		console.log("Error fetching song:", err);
		return null;
	}
}

// captions
function makeCaption(song) {
	const captions = [
		`🎵 ${song}\nA sound worth replaying. #MusicBot`,
		`🎧 ${song}\nNew track discovery. #MusicBot`,
		`🎶 ${song}\nQueue updated. #MusicBot`,
		`🔊 ${song}\nMax volume recommended. #MusicBot`,
		`🎼 ${song}\nWorth a listen. #MusicBot`,
		`🎤 ${song}\nAdded to the rotation. #MusicBot`,
	];

	return captions[Math.floor(Math.random() * captions.length)];
}

// genre detection
function detectGenre(text) {
	text = text.toLowerCase();
	for (let g of GENRES) {
		if (text.includes(g)) return g;
	}
	return null;
}

// post limit
async function canPost() {
	const state = await getState();

	if (state.postsToday >= 50) {
		console.log("Daily limit reached");
		return { allowed: false, state };
	}

	return { allowed: true, state };
}

async function incrementPostCount(state) {
	state.postsToday++;
	await updateState(state);
}

// replies
async function processMention(id, statusId, content) {
	if (await hasReplied(id)) return;

	const { allowed, state } = await canPost();
	if (!allowed) return;

	const genre = detectGenre(content);
	const song = await getSong(genre);
	if (!song) return;

	const replyText = `🎧 ${song}\nSuggested ${genre || "music"} track. #MusicBot #Requested`;

	await masto.v1.statuses.create({
		status: replyText,
		in_reply_to_id: statusId,
		visibility: "public",
	});

	await saveReply(id);
	await saveSong(song);
	await incrementPostCount(state);

	console.log("Replied:", replyText);
}

const reply = async () => {
	const notifications = await stream.user.notification.subscribe();

	for await (let notif of notifications) {
		if (notif.payload.type !== "mention") continue;

		const text = new jsdom.JSDOM(notif.payload.status.content)
			.window.document.querySelector("p").textContent;

		await processMention(
			notif.payload.id,
			notif.payload.status.id,
			text
		);
	}
};

// posts
const makeStatus = async () => {
	const { allowed, state } = await canPost();
	if (!allowed) return;

	const song = await getSong();
	if (!song) return;

	const post = makeCaption(song);

	const s = await masto.v1.statuses.create({
		status: post,
		visibility: "public",
	});

	await saveSong(song);
	await incrementPostCount(state);

	console.log("Posted:", s.url);
};

setInterval(makeStatus, 2700000);
reply();

console.log("bot running");