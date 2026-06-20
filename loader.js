document.addEventListener("DOMContentLoaded", () => {
    const percentEl = document.getElementById("loader-percent");
    const loader = document.getElementById("loader");
    const mobileNotice = document.getElementById("mobile-notice");

    if (!percentEl || !loader) return;

    // If loader already shown this session, never show it again
    if (sessionStorage.getItem("loaderShown")) {
        return;
    }

    sessionStorage.setItem("loaderShown", "true");

    // Setup suitcase lock wheels
    percentEl.innerHTML = `
      <div class="lock-wheel"><div class="lock-strip" id="wheel-hundreds"><span>0</span><span>1</span></div></div>
      <div class="lock-wheel"><div class="lock-strip" id="wheel-tens"><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span></div></div>
      <div class="lock-wheel"><div class="lock-strip" id="wheel-ones"><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span></div></div>
      <span class="lock-percent">%</span>
    `;
    const hundredsStrip = document.getElementById("wheel-hundreds");
    const tensStrip = document.getElementById("wheel-tens");
    const onesStrip = document.getElementById("wheel-ones");

    // Show loader only when needed
    loader.style.display = "flex";

    const LOADER_DURATION = 2000;
    const startTime = Date.now();

    // Mobile notice
    if (mobileNotice && window.innerWidth <= 768) {
        setTimeout(() => {
            mobileNotice.style.opacity = "1";
        }, 300);

        setTimeout(() => {
            mobileNotice.style.opacity = "0";
        }, 3300);
    }

    function updateProgress() {
        const elapsed = Date.now() - startTime;

        const progress = Math.min(
            (elapsed / LOADER_DURATION) * 100,
            100
        );

        const displayValue = Math.floor(progress);
        const hundreds = Math.floor(displayValue / 100);
        const tens = Math.floor((displayValue % 100) / 10);
        const ones = displayValue % 10;

        if (hundredsStrip) hundredsStrip.style.transform = `translateY(${-hundreds * 50}%)`;
        if (tensStrip) tensStrip.style.transform = `translateY(${-tens * 10}%)`;
        if (onesStrip) onesStrip.style.transform = `translateY(${-ones * 10}%)`;

        if (progress < 100) {
            requestAnimationFrame(updateProgress);
        } else {
            if (hundredsStrip) hundredsStrip.style.transform = "translateY(-50%)";
            if (tensStrip) tensStrip.style.transform = "translateY(0%)";
            if (onesStrip) onesStrip.style.transform = "translateY(0%)";

            loader.classList.add("fade-out");

            setTimeout(() => {
                loader.style.display = "none";
            }, 400);
        }
    }

    requestAnimationFrame(updateProgress);
});