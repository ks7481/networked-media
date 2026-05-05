// share
function shareResult() {
    fetch('/share', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('share-link-container');
            if (!container) return;
            const url = window.location.origin + data.url;
            container.innerHTML =
                '<div class="card share-card">' +
                    '<p class="share-url-label">Your unique result URL:</p>' +
                    '<div class="share-url-row">' +
                        '<input type="text" value="' + url + '" id="shareUrl" readonly class="share-url-input">' +
                        '<button onclick="copyLink()" class="btn btn-primary">Copy</button>' +
                    '</div>' +
                '</div>';
        })
        .catch(function(err) { console.error('Share error:', err); });
}

function copyLink() {
    var input = document.getElementById('shareUrl');
    if (!input) return;
    input.select();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(input.value).then(showSharePopup).catch(function() {
            document.execCommand('copy');
            showSharePopup();
        });
    } else {
        document.execCommand('copy');
        showSharePopup();
    }
}

function showSharePopup() {
    var popup = document.getElementById('share-popup');
    if (!popup) return;
    popup.classList.add('share-popup-visible');
    setTimeout(function() {
        popup.classList.remove('share-popup-visible');
    }, 3000);
}

// calm
var breatheActive = false;
var breatheTimeout = null;

function startBreathe(btn) {
    var ring  = document.getElementById('breatheRing');
    var label = document.getElementById('breatheLabel');
    if (!ring) return;

    if (breatheActive) {
        clearTimeout(breatheTimeout);
        breatheActive = false;
        ring.classList.remove('breathing-in', 'breathing-out');
        if (label) label.textContent = 'breathe';
        btn.textContent = 'Begin Breathing Exercise';
        return;
    }

    breatheActive = true;
    btn.textContent = 'Stop';

    var phases    = ['breathe in', 'hold', 'breathe out', 'hold'];
    var durations = [4000, 2000, 4000, 2000];
    var phase     = 0;

    function runPhase() {
        if (!breatheActive) return;
        if (label) label.textContent = phases[phase];
        if (phase === 0) {
            ring.classList.remove('breathing-out');
            ring.classList.add('breathing-in');
        } else if (phase === 2) {
            ring.classList.remove('breathing-in');
            ring.classList.add('breathing-out');
        }
        var next = (phase + 1) % 4;
        breatheTimeout = setTimeout(function() {
            phase = next;
            runPhase();
        }, durations[phase]);
    }
    runPhase();
}

function calmSwatchHover(el) {
    var color = el.getAttribute('data-color');
    var hint  = document.getElementById('paletteHint');
    if (hint) {
        hint.textContent  = color;
        hint.style.opacity = '0.9';
    }
}

function calmSwatchLeave() {
    var hint = document.getElementById('paletteHint');
    if (hint) {
        hint.textContent  = 'hover to feel each tone';
        hint.style.opacity = '0.4';
    }
}

function calmToggleExpand(btn) {
    var card = btn.closest('.calm-expand-card');
    if (!card) return;
    var body    = card.querySelector('.calm-expand-body');
    var iconEl  = btn.querySelector('.expand-icon');
    btn.classList.toggle('expanded');
    if (body) body.classList.toggle('open');
    if (iconEl) iconEl.textContent = btn.classList.contains('expanded') ? '×' : '+';
}

// chaotic
var chaosLevel = 0;

function incrementChaos() {
    chaosLevel++;
    var el = document.getElementById('chaosCounterVal');
    if (!el) return;
    el.textContent = chaosLevel;
    el.classList.add('bump');
    setTimeout(function() { el.classList.remove('bump'); }, 200);

    if (chaosLevel >= 5) {
        document.querySelectorAll('.chaos-card').forEach(function(card) {
            var r = (Math.random() * 8 - 4).toFixed(1);
            card.style.transform = 'rotate(' + r + 'deg)';
        });
    }
    if (chaosLevel >= 10) {
        document.body.style.filter = 'hue-rotate(' + ((chaosLevel * 7) % 360) + 'deg)';
    }
    if (chaosLevel >= 20) {
        var grid = document.getElementById('chaoticGrid');
        if (grid) grid.style.animation = 'jitter 0.4s infinite';
    }
}

var _scrambleChars = '!@#$%^&*ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567';

function scrambleText() {
    var el = document.getElementById('scrambleTarget');
    if (!el) return;
    var original = el.dataset.original || el.textContent;
    el.dataset.original = original;

    var iterations    = 0;
    var maxIterations = original.length * 3;

    var interval = setInterval(function() {
        el.textContent = original.split('').map(function(char, i) {
            if (char === ' ') return ' ';
            if (i < Math.floor(iterations / 3)) return original[i];
            return _scrambleChars[Math.floor(Math.random() * _scrambleChars.length)];
        }).join('');
        iterations++;
        if (iterations > maxIterations) clearInterval(interval);
    }, 40);
}

// flash warning popup helpers
function _chaosShowFlashPopup() {
    var overlay = document.getElementById('chaosFlashOverlay');
    if (!overlay) return;
    overlay.classList.add('chaos-flash-overlay-visible');
    overlay.setAttribute('aria-hidden', 'false');
}

function _chaosHideFlashPopup() {
    var overlay = document.getElementById('chaosFlashOverlay');
    if (!overlay) return;
    overlay.classList.remove('chaos-flash-overlay-visible');
    overlay.setAttribute('aria-hidden', 'true');
}

function chaosFlashContinue() {
    localStorage.setItem('chaosFlashChoice', 'allowed');
    _chaosHideFlashPopup();
    _chaosRunDetonate(true);
}

function chaosFlashDisable() {
    localStorage.setItem('chaosFlashChoice', 'disabled');
    _chaosHideFlashPopup();
    _chaosRunDetonate(false);
}

function _chaosRunDetonate(flashAllowed) {
    var hub = document.querySelector('.chaotic-hub');
    if (!hub) return;

    if (flashAllowed) {
        hub.style.transition = 'none';
        hub.style.filter = 'invert(1) brightness(2)';
        setTimeout(function() {
            hub.style.filter = 'none';
            hub.style.transition = 'filter 0.5s ease';
        }, 100);
    }

    document.querySelectorAll('.chaos-card').forEach(function(card, i) {
        var x = (Math.random() * 40 - 20).toFixed(0);
        var y = (Math.random() * 30 - 15).toFixed(0);
        var r = (Math.random() * 24 - 12).toFixed(1);
        card.style.transition = 'transform 0.35s cubic-bezier(.36,.07,.19,.97)';
        card.style.transform  = 'translate(' + x + 'px,' + y + 'px) rotate(' + r + 'deg)';
        setTimeout(function() {
            card.style.transform = '';
        }, 600 + i * 60);
    });

    chaosLevel += 5;
    var el = document.getElementById('chaosCounterVal');
    if (el) {
        el.textContent = chaosLevel;
        el.classList.add('bump');
        setTimeout(function() { el.classList.remove('bump'); }, 200);
    }
}

function chaosDetonate() {
    var choice = localStorage.getItem('chaosFlashChoice');
    if (choice === 'allowed') {
        _chaosRunDetonate(true);
    } else if (choice === 'disabled') {
        _chaosRunDetonate(false);
    } else {
        _chaosShowFlashPopup();
    }
}

// direct
var directOptimized = false;

function toggleDirectCheck(li) {
    li.classList.toggle('checked');
    var box = li.querySelector('.direct-check-box');
    if (box) box.textContent = li.classList.contains('checked') ? '[x]' : '[ ]';

    var allItems    = document.querySelectorAll('.direct-check-item');
    var checkedNow  = document.querySelectorAll('.direct-check-item.checked').length;
    var total       = allItems.length;
    var pct         = total ? Math.round((checkedNow / total) * 100) : 0;

    var fill  = document.getElementById('directProgress');
    var label = document.getElementById('directProgressLabel');
    if (fill)  fill.style.width  = pct + '%';
    if (label) label.textContent = checkedNow + ' / ' + total + ' complete';
}

function directOptimizeToggle() {
    var btn  = document.getElementById('optimizeBtn');
    var hint = document.getElementById('optimizeHint');
    directOptimized = !directOptimized;

    if (directOptimized) {
        document.querySelectorAll('.direct-img-block').forEach(function(el) { el.style.display = 'none'; });
        if (btn)  { btn.textContent = 'Restore View'; btn.classList.add('optimized'); }
        if (hint) hint.textContent = '// minimal mode active';
    } else {
        document.querySelectorAll('.direct-img-block').forEach(function(el) { el.style.display = ''; });
        if (btn)  { btn.textContent = 'Optimize View'; btn.classList.remove('optimized'); }
        if (hint) hint.textContent = 'Toggle minimal mode';
    }
}

function optimizeView() { directOptimizeToggle(); }

// curious
function curiousRevealHidden(card) {
    card.classList.add('revealed');
    card.style.cursor = 'default';
}

function revealQuestion() {
    var questions = window._oracleQuestions;
    if (!questions || !questions.length) return;
    window._oracleIndex = ((window._oracleIndex || -1) + 1) % questions.length;

    var text = document.getElementById('oracleText');
    if (!text) return;
    text.classList.add('fading');
    var q = questions[window._oracleIndex];
    setTimeout(function() {
        text.textContent = q;
        text.classList.remove('fading');
    }, 400);
}

// analytical
window.anaTypeTerminal = function() {
    var container = document.getElementById('anaTerminal');
    var lines     = window._termLines;
    if (!container || !lines) return;

    container.innerHTML = '';
    var lineIdx = 0;

    function typeLine() {
        if (lineIdx >= lines.length) {
            var cursor = document.createElement('span');
            cursor.className = 'ana-terminal-cursor';
            container.appendChild(cursor);
            return;
        }
        var lineText = lines[lineIdx];
        var span     = document.createElement('span');
        span.className = 'ana-terminal-line';
        container.appendChild(span);

        var charIdx  = 0;
        var charInt  = setInterval(function() {
            span.textContent = lineText.slice(0, charIdx + 1);
            charIdx++;
            if (charIdx >= lineText.length) {
                clearInterval(charInt);
                container.appendChild(document.createTextNode('\n'));
                lineIdx++;
                setTimeout(typeLine, 100);
            }
        }, 26);
    }
    typeLine();
};

function runFullAnalysis() {
    var btn    = document.getElementById('anaRunBtn');
    var output = document.getElementById('anaRunOutput');
    if (!btn || !output) return;

    btn.disabled    = true;
    btn.textContent = '> running...';

    var data   = window.HUB_DATA || {};
    var pType  = (data.personality || 'analytical').toUpperCase();

    var lines = [
        '> initializing behavioral_matrix...',
        '> loading cursor_dataset...',
        '> cross-referencing quiz_vectors...',
        '> computing confidence_intervals...',
        '> primary_type: ' + pType,
        '> pattern_match: 94.3%',
        '> anomaly_detection: none',
        '> synthesis: COMPLETE ✓'
    ];

    output.textContent = '';
    var i = 0;
    var interval = setInterval(function() {
        output.textContent += lines[i] + '\n';
        i++;
        if (i >= lines.length) {
            clearInterval(interval);
            btn.disabled = false;
            btn.innerHTML = '<span class="ana-run-icon">▶</span> > run_analysis.exe';
        }
    }, 310);
}

// playful
var _confettiColors = ['#ff9de2', '#6ec6ff', '#aaff80', '#ffd26f', '#ff6b9d', '#c3f0ca', '#b8d4ff', '#ffb347'];
var _confettiFrame  = null;

function dropConfetti() {
    var canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext('2d');

    var particles = [];
    for (var n = 0; n < 140; n++) {
        particles.push({
            x:     Math.random() * canvas.width,
            y:     -20 - Math.random() * (canvas.height * 0.5),
            w:     5 + Math.random() * 10,
            h:     3 + Math.random() * 6,
            color: _confettiColors[Math.floor(Math.random() * _confettiColors.length)],
            vx:    (Math.random() - 0.5) * 4,
            vy:    3 + Math.random() * 5,
            angle: Math.random() * Math.PI * 2,
            spin:  (Math.random() - 0.5) * 0.2,
            alpha: 1
        });
    }

    cancelAnimationFrame(_confettiFrame);

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var anyAlive = false;
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            if (p.alpha <= 0) continue;
            anyAlive = true;
            p.x += p.vx;
            p.y += p.vy;
            p.angle += p.spin;
            if (p.y > canvas.height * 0.75) p.alpha -= 0.025;
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        }
        if (anyAlive) {
            _confettiFrame = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    animate();
}

function emojiVote(btn, label) {
    document.querySelectorAll('.playful-emoji-btn').forEach(function(b) {
        b.classList.remove('selected');
    });
    btn.classList.add('selected');
    var result = document.getElementById('voteResult');
    var vibes  = {
        rainbow: '🌈 Chasing every color today!',
        circus:  '🎪 Life is your big top!',
        magic:   '🦄 Something wonderful is near.',
        drama:   '🎭 Every moment deserves a stage.'
    };
    if (result) result.textContent = vibes[label] || ('You chose: ' + label);
}

var _wheelSpinning  = false;
var _wheelRotation  = 0;

function spinWheel() {
    if (_wheelSpinning) return;
    var options = window._wheelOptions;
    if (!options || !options.length) return;

    _wheelSpinning = true;
    var btn    = document.getElementById('spinBtn');
    var wheel  = document.getElementById('playfulWheel');
    var result = document.getElementById('wheelResult');

    if (btn)    btn.disabled = true;
    if (result) result.textContent = '';

    var extra  = 1800 + Math.random() * 720;
    var target = _wheelRotation + extra;
    var picked = options[Math.floor(Math.random() * options.length)];

    if (wheel) wheel.style.transform = 'rotate(' + target + 'deg)';
    _wheelRotation = target % 360;

    setTimeout(function() {
        if (result) result.textContent = picked;
        if (btn)    btn.disabled = false;
        _wheelSpinning = false;
    }, 1600);
}

document.addEventListener('DOMContentLoaded', function() {
    // analytical
    if (document.getElementById('anaTerminal') && typeof window.anaTypeTerminal === 'function') {
        window.anaTypeTerminal();
    }
    document.querySelectorAll('.ana-chart-bar').forEach(function(bar) {
        var w = bar.getAttribute('data-width');
        if (w) setTimeout(function() { bar.style.width = w; }, 500);
    });

    // profile
    document.querySelectorAll('.bar').forEach(function(bar) {
        var w = getComputedStyle(bar).getPropertyValue('--bar-width');
        if (w && w.trim()) {
            bar.style.width = '0';
            setTimeout(function() { bar.style.width = w; }, 100);
        }
    });

});