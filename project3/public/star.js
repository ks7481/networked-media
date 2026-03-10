document.addEventListener("DOMContentLoaded", () => {
  const starGroups = document.querySelectorAll(".star-rating");

  starGroups.forEach((group) => {
    const stars = group.querySelectorAll(".star");
    const input = group.querySelector("input");

    stars.forEach((star) => {
      star.addEventListener("click", () => {
        let value = star.dataset.value;
        input.value = value;

        stars.forEach((s) => {
          if (s.dataset.value <= value) {
            s.classList.add("selected");
          } else {
            s.classList.remove("selected");
          }
        });
      });
    });
  });
});