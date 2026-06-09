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

        percentEl.textContent = Math.floor(progress) + "%";

        if (progress < 100) {
            requestAnimationFrame(updateProgress);
        } else {
            percentEl.textContent = "100%";

            loader.classList.add("fade-out");

            setTimeout(() => {
                loader.style.display = "none";
            }, 400);
        }
    }

    requestAnimationFrame(updateProgress);
});