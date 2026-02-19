window.onload = () => {
  const container = document.getElementById("container");
  const word = document.getElementById("mood");

  const colors = [
    [20,20,25], [25,25,35], [35,30,45], [45,40,60], [55,50,70],
    [240,240,240], [255,245,200], [255,220,150], [255,190,120], [150,230,255], [200,255,255],
    [255,80,80], [255,140,70], [255,220,0], [80,200,120], [50,130,255],
    [255,170,0], [255,120,100], [255,90,130],
    [70,130,200], [200,90,160], [140,80,180],
    [40,40,50], [15,15,20]
  ];

  const words = {
    early: ["dim", "distant", "hushed", "gloomy"],
    morning: ["refresh", "aurora", "tranquility", "gentle"],
    afternoon: ["flowery", "radiant", "active", "alert"],
    lateAfternoon: ["drowsy", "shifting", "weary"],
    evening: ["calm", "settling", "low"],
    night: ["still", "quiet", "heavy"]
  };

  function interpolateRGB(c1, c2, factor) {
    return [
      (c1[0] + (c2[0] - c1[0]) * factor),
      (c1[1] + (c2[1] - c1[1]) * factor),
      (c1[2] + (c2[2] - c1[2]) * factor)
    ];
  }

  function updateBackground(hour, minute, second) {

    const current = colors[hour];
    const next = colors[(hour + 1) % 24];

    const progress = (minute * 60 + second) / 3600;

    const blended = interpolateRGB(current, next, progress);

    container.style.background = `rgb(${blended[0]}, ${blended[1]}, ${blended[2]})`;
  }

  let currentWord = "";

  function updateWord(hour) {

    let group;
    let weight;
    let speed;

    if (hour >= 1 && hour <= 4) {
      group = words.early;
      weight = 200;
      speed = 0.5;
    } else if (hour >= 5 && hour <= 10) {
      group = words.morning;
      weight = 300;
      speed = 0.7;
    } else if (hour >= 11 && hour <= 15) {
      group = words.afternoon;
      weight = 750;
      speed = 1.8;
    } else if (hour >= 16 && hour <= 18) {
      group = words.lateAfternoon;
      weight = 600;
      speed = 1.3;
    } else if (hour >= 19 && hour <= 21) {
      group = words.evening;
      weight = 300;
      speed = 0.8;
    } else {
      group = words.night;
      weight = 200;
      speed = 0.4;
    }

    const newWord = group[hour % group.length];

    if (newWord !== currentWord) {
      word.style.opacity = 0;
      setTimeout(() => {
        word.textContent = newWord;
        word.style.opacity = 1;
      }, 300);
      currentWord = newWord;
    }

    word.style.fontWeight = weight;
    return speed;
  }

  let x, y;
  let dx = 1;
  let dy = 1;
  let speed = 1;

  function centerWord() {
    const rect = word.getBoundingClientRect();
    x = (window.innerWidth - rect.width) / 2;
    y = (window.innerHeight - rect.height) / 2;
    word.style.left = x + "px";
    word.style.top = y + "px";
  }

  function animate() {
    const rect = word.getBoundingClientRect();

    x += dx * speed;
    y += dy * speed;

    if (x <= 0 || x + rect.width >= window.innerWidth) dx *= -1;
    if (y <= 0 || y + rect.height >= window.innerHeight) dy *= -1;

    word.style.left = x + "px";
    word.style.top = y + "px";

    requestAnimationFrame(animate);
  }

  function updateClock() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();

    updateBackground(hour, minute, second);
    speed = updateWord(hour);
  }

  updateClock();
  centerWord();
  animate();
  setInterval(updateClock, 1000);
};