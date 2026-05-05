(function () {
    let events = [];
    let isTracking = false;
    let lastMove = 0;
    let lastPoint = null;

    let trailPoints = [];
    const MAX_TRAIL = 20;

    const trackingEnabled = sessionStorage.getItem('trackingStarted') === 'true';

    const path = window.location.pathname;
    const isPassivePage = path === '/profile' || path.startsWith('/archive/');

    if (trackingEnabled && !isPassivePage) {
        isTracking = true;
    }

    function getSpeedCategory(velocity) {
        if (velocity < 150) return 'slow';
        if (velocity < 400) return 'medium';
        return 'fast';
    }

    const sendData = () => {
        if (events.length === 0) return;
        fetch('/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events })
        });
        events = [];
    };

    if (isTracking) {
        window.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastMove > 100) {
                let velocity = 0;
                let speedCategory = 'medium';
                if (lastPoint) {
                    const dx = e.clientX - lastPoint.x;
                    const dy = e.clientY - lastPoint.y;
                    const dt = (now - lastPoint.timestamp) / 1000;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    velocity = dt > 0 ? dist / dt : 0;
                    speedCategory = getSpeedCategory(velocity);
                }

                const point = {
                    x: e.clientX,
                    y: e.clientY,
                    timestamp: now,
                    eventType: 'mousemove',
                    velocity: Math.round(velocity),
                    speedCategory
                };

                events.push(point);

                trailPoints.push(point);
                if (trailPoints.length > MAX_TRAIL) trailPoints.shift();

                lastPoint = point;
                lastMove = now;
            }
        });

        window.addEventListener('click', (e) => {
            const point = {
                x: e.clientX,
                y: e.clientY,
                timestamp: Date.now(),
                eventType: 'click',
                velocity: lastPoint ? lastPoint.velocity : 0,
                speedCategory: lastPoint ? lastPoint.speedCategory : 'medium'
            };
            events.push(point);
        });

        setInterval(sendData, 3000);
        window.addEventListener('beforeunload', sendData);
    }

    window._cursorTrail = trailPoints;

    window.beginTracking = function () {
        sessionStorage.setItem('trackingStarted', 'true');
        window.location.href = '/quiz';
    };
})();