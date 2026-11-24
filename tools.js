// ============================================================
// ১. ইমেইল নিরাপত্তা পরীক্ষা
// ============================================================
function checkEmail() {
    const input = document.getElementById('emailInput').value.trim();
    const resultDiv = document.getElementById('emailResult');
    resultDiv.className = 'result-box';
    resultDiv.style.display = 'block';

    if (!input) {
        resultDiv.classList.add('danger');
        resultDiv.innerHTML = 'Please enter an email address.';
        return;
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const formatValid = regex.test(input);
    const domain = input.split('@')[1] || '';
    const commonDomains = ['gmail.com','yahoo.com','outlook.com','hotmail.com','protonmail.com','icloud.com'];
    const isKnown = commonDomains.includes(domain.toLowerCase());

    let html = '';
    if (formatValid) {
        resultDiv.classList.add('success');
        html += `<strong>✓ Format:</strong> Valid<br>`;
        html += `<strong>Domain:</strong> ${domain}<br>`;
        html += `<strong>Known provider:</strong> ${isKnown ? 'Yes' : 'No (uncommon)'}<br><br>`;
        html += `<strong>Safety tips:</strong><br>`;
        html += `• Never post your email publicly on social media or forums.<br>`;
        html += `• Use a separate email for banking and important accounts.<br>`;
        html += `• Enable two-factor authentication on your email account.<br>`;
        html += `• Be careful of phishing emails asking for personal information.`;
    } else {
        resultDiv.classList.add('danger');
        html += `<strong>✗ Format:</strong> Invalid<br>`;
        html += `Please check for missing @, domain, or dot (.).`;
    }
    resultDiv.innerHTML = html;
}

// ============================================================
// ২. সংখ্যা বিন্যাস গণনা (প্রথম ১০,০০০ ফ্রি + বাকি ডাউনলোড)
// ============================================================
const FREE_LIMIT = 10000;

function calculateCombination() {
    const input = document.getElementById('numInput').value.trim();
    const mode = document.getElementById('numMode').value;
    const resultDiv = document.getElementById('numResult');
    resultDiv.className = 'result-box';
    resultDiv.style.display = 'block';

    if (!input || !/^[1-9]+$/.test(input)) {
        resultDiv.classList.add('danger');
        resultDiv.innerHTML = 'Please enter digits 1-9 only.';
        return;
    }

    const digits = input.split('');
    const n = digits.length;
    const uniqueDigits = [...new Set(digits)];

    // ===== মোট সংখ্যা হিসাব =====
    let total = 0;
    let formula = '';

    if (mode === 'permutation') {
        const counts = {};
        digits.forEach(d => counts[d] = (counts[d] || 0) + 1);
        let denominator = 1;
        Object.values(counts).forEach(c => denominator *= factorial(c));
        total = factorial(n) / denominator;
        formula = `${n}! / (repeated factorials) = ${total.toLocaleString()}`;
    } else {
        total = Math.pow(uniqueDigits.length, n);
        formula = `${uniqueDigits.length}^${n} = ${total.toLocaleString()}`;
    }

    // ===== প্রথম ১০,০০০ তালিকা তৈরি =====
    let previewList = [];

    if (mode === 'permutation') {
        const permute = (arr, current) => {
            if (previewList.length >= FREE_LIMIT) return;
            if (arr.length === 0) {
                previewList.push(current.join(''));
                return;
            }
            for (let i = 0; i < arr.length; i++) {
                if (previewList.length >= FREE_LIMIT) break;
                const rest = arr.slice(0, i).concat(arr.slice(i + 1));
                permute(rest, current.concat(arr[i]));
            }
        };
        permute(digits, []);
        previewList = [...new Set(previewList)];
    } else {
        const build = (current) => {
            if (previewList.length >= FREE_LIMIT) return;
            if (current.length === n) {
                previewList.push(current.join(''));
                return;
            }
            for (const d of uniqueDigits) {
                if (previewList.length >= FREE_LIMIT) break;
                build(current.concat(d));
            }
        };
        build([]);
    }

    const listHtml = previewList
        .map(num => `<span class="arrangement-item">${num}</span>`)
        .join(' ');

    const totalDisplay = formatLargeNumber(total);
    const remaining = total - FREE_LIMIT;

    // ===== ফলাফল HTML =====
    let html = `
        <strong>Input digits:</strong> ${digits.join(', ')}<br>
        <strong>Mode:</strong> ${mode === 'permutation' ? 'Permutation (no repeat)' : 'Combination (with repeat)'}<br><br>
        <strong>First ${previewList.length.toLocaleString()} arrangements (free preview):</strong>
        <div class="arrangement-list">${listHtml}</div>
    `;

    if (total > FREE_LIMIT) {
        html += `
            <div class="download-gate">
                <div class="download-gate-icon">📥</div>
                <div class="download-gate-text">
                    <strong>${remaining.toLocaleString()}</strong> more arrangements available.
                </div>
                <div class="download-gate-sub">
                    Watch a short ad to download the full list.
                </div>
                <button class="btn-calc" onclick="downloadFullList('number')">
                    ⬇ Watch Ad & Download Full List
                </button>
            </div>
        `;
    }

    html += `
        <div class="total-highlight">
            <div class="total-label">এই ${digits.join('')} সংখ্যা দিয়ে মোট:</div>
            <div class="total-number">${totalDisplay}</div>
            <div class="total-label">টি ভিন্ন সংখ্যা/পাসওয়ার্ড বানানো যাবে</div>
            <small style="color:var(--text-light); font-size:0.8rem; margin-top:8px; display:block;">
                Formula: ${formula}
            </small>
        </div>
    `;

    resultDiv.classList.add('success');
    resultDiv.innerHTML = html;

    window._currentCalc = { type: 'number', input, mode, total, digits, n, uniqueDigits };
}

// ============================================================
// ৩. পাসওয়ার্ড শক্তি + মোট সম্ভাব্য পাসওয়ার্ড (ডাউনলোড গেটেড)
// ============================================================
function checkPasswordStrength() {
    const input = document.getElementById('passInput').value.trim();
    const resultDiv = document.getElementById('passResult');
    resultDiv.className = 'result-box';
    resultDiv.style.display = 'block';

    if (!input) {
        resultDiv.classList.add('danger');
        resultDiv.innerHTML = 'Please enter a sample password.';
        return;
    }

    // ===== শক্তি বিশ্লেষণ =====
    let score = 0;
    const checks = {
        length: input.length >= 12,
        upper: /[A-Z]/.test(input),
        lower: /[a-z]/.test(input),
        digit: /[0-9]/.test(input),
        symbol: /[^A-Za-z0-9]/.test(input),
        notCommon: !['password','123456','qwerty','zakir374'].includes(input.toLowerCase())
    };
    Object.values(checks).forEach(v => { if (v) score++; });
    const strength = score >= 5 ? 'Strong' : score >= 3 ? 'Medium' : 'Weak';
    const className = score >= 5 ? 'success' : score >= 3 ? 'warning' : 'danger';

    // ===== নাম+সংখ্যা বিশ্লেষণ =====
    const nameMatch = input.match(/[A-Za-z]+/);
    const numMatch = input.match(/[0-9]+/);
    const name = nameMatch ? nameMatch[0] : '';
    const num = numMatch ? numMatch[0] : '';

    let previewList = [];
    let total = 0;
    let formula = '';

    if (name && num) {
        const nameVariants = [name, capitalize(name), name.toUpperCase(), name.toLowerCase()];
        const uniqueNameVariants = [...new Set(nameVariants)];
        const numPerms = permuteString(num);
        const uniqueNums = [...new Set(numPerms)];

        const symbols = ['', '!', '@', '#', '$', '123', '2024', '2025'];
        const separators = ['', '_', '.', '-'];

        outer:
        for (const nv of uniqueNameVariants) {
            for (const nm of uniqueNums) {
                for (const sep of separators) {
                    for (const sym of symbols) {
                        if (previewList.length >= FREE_LIMIT) break outer;
                        previewList.push(nv + sep + nm + sym);
                        if (previewList.length < FREE_LIMIT) {
                            previewList.push(nm + sep + nv + sym);
                        }
                    }
                }
            }
        }
        previewList = [...new Set(previewList)];

        total = uniqueNameVariants.length * uniqueNums.length * separators.length * symbols.length * 2;
        formula = `${uniqueNameVariants.length} নাম × ${uniqueNums.length} সংখ্যা × ${separators.length} বিভাজক × ${symbols.length} প্রতীক × 2 ক্রম = ${total.toLocaleString()}`;
    } else {
        const charset = /[0-9]/.test(input) && /[A-Za-z]/.test(input) ? 62 : 
                       /[A-Za-z]/.test(input) ? 52 : 10;
        total = Math.pow(charset, input.length);
        formula = `${charset}^${input.length} = ${total.toLocaleString()}`;
        previewList = [input];
    }

    const totalDisplay = formatLargeNumber(total);
    const remaining = total - FREE_LIMIT;

    // ===== ফলাফল HTML =====
    let html = `<strong>Sample password:</strong> ${input}<br>`;
    html += `<strong>Length:</strong> ${input.length}<br>`;
    html += `<strong>Strength:</strong> <span style="font-weight:700;">${strength}</span><br><br>`;

    html += `<strong>Analysis:</strong><br>`;
    html += `${checks.length ? '✓' : '✗'} Length ≥ 12 characters<br>`;
    html += `${checks.upper ? '✓' : '✗'} Uppercase (A-Z)<br>`;
    html += `${checks.lower ? '✓' : '✗'} Lowercase (a-z)<br>`;
    html += `${checks.digit ? '✓' : '✗'} Digit (0-9)<br>`;
    html += `${checks.symbol ? '✓' : '✗'} Symbol (!@#$...)<br>`;
    html += `${checks.notCommon ? '✓' : '✗'} Not a common password<br><br>`;

    if (previewList.length > 0 && name && num) {
        const listHtml = previewList
            .map(p => `<span class="arrangement-item">${p}</span>`)
            .join(' ');
        html += `<strong>First ${previewList.length.toLocaleString()} possible passwords (free preview):</strong>`;
        html += `<div class="arrangement-list">${listHtml}</div>`;
    }

    if (total > FREE_LIMIT) {
        html += `
            <div class="download-gate">
                <div class="download-gate-icon">📥</div>
                <div class="download-gate-text">
                    <strong>${remaining.toLocaleString()}</strong> more passwords available.
                </div>
                <div class="download-gate-sub">
                    Watch a short ad to download the full list.
                </div>
                <button class="btn-calc" onclick="downloadFullList('password')">
                    ⬇ Watch Ad & Download Full List
                </button>
            </div>
        `;
    }

    html += `
        <div class="total-highlight">
            <div class="total-label">এই "${input}" দিয়ে মোট:</div>
            <div class="total-number">${totalDisplay}</div>
            <div class="total-label">টি পাসওয়ার্ড বানানো যাবে</div>
            <small style="color:var(--text-light); font-size:0.8rem; margin-top:8px; display:block;">
                ${formula}
            </small>
        </div>
    `;

    if (strength === 'Weak') {
        html += `<br><strong>Why is this weak?</strong><br>`;
        html += `Passwords like "name+number" are easy to guess. Attackers use dictionaries and common patterns.<br><br>`;
        html += `<strong>How to improve:</strong><br>`;
        html += `• Use at least 12 characters<br>• Mix uppercase, lowercase, digits, and symbols<br>• Avoid personal names and birthdays<br>• Use unique passwords for each account<br>• Consider a password manager`;
    } else if (strength === 'Medium') {
        html += `<br><strong>Good, but can be stronger.</strong> Add length or symbols.`;
    } else {
        html += `<br><strong>Excellent!</strong> This password follows good practices.`;
    }

    resultDiv.classList.add(className);
    resultDiv.innerHTML = html;

    window._currentCalc = { type: 'password', input, name, num, total };
}

// ============================================================
// ৪. ডাউনলোড গেট (অ্যাড দেখে ডাউনলোড)
// ============================================================
function downloadFullList(type) {
    // ⚠️ এখানে আপনার বিজ্ঞাপন লিংক বসান (Adsterra Direct Link)
    const AD_URL = 'https://your-ad-network-link.com'; // ← এখানে পরিবর্তন করুন

    window.open(AD_URL, '_blank');
    alert('Ad opened in a new tab. After viewing the ad, close it and click OK to download the full list.');

    // ৫ সেকেন্ড পর ডাউনলোড শুরু
    setTimeout(() => {
        triggerDownload(type);
    }, 5000);
}

function triggerDownload(type) {
    const data = window._currentCalc;
    if (!data) return;

    let fullList = [];
    let filename = '';

    if (type === 'number' && data.type === 'number') {
        const { digits, n, mode, total } = data;
        const uniqueDigits = [...new Set(digits)];

        if (mode === 'permutation') {
            const permute = (arr, current) => {
                if (fullList.length >= total) return;
                if (arr.length === 0) {
                    fullList.push(current.join(''));
                    return;
                }
                for (let i = 0; i < arr.length; i++) {
                    const rest = arr.slice(0, i).concat(arr.slice(i + 1));
                    permute(rest, current.concat(arr[i]));
                }
            };
            permute(digits, []);
            fullList = [...new Set(fullList)];
        } else {
            const build = (current) => {
                if (fullList.length >= total) return;
                if (current.length === n) {
                    fullList.push(current.join(''));
                    return;
                }
                for (const d of uniqueDigits) {
                    if (fullList.length >= total) break;
                    build(current.concat(d));
                }
            };
            build([]);
        }
        filename = `arrangements_${data.input}.txt`;
    } else if (type === 'password' && data.type === 'password') {
        const { name, num, total } = data;
        const nameVariants = [name, capitalize(name), name.toUpperCase(), name.toLowerCase()];
        const uniqueNameVariants = [...new Set(nameVariants)];
        const numPerms = permuteString(num);
        const uniqueNums = [...new Set(numPerms)];

        const symbols = ['', '!', '@', '#', '$', '123', '2024', '2025'];
        const separators = ['', '_', '.', '-'];

        outer:
        for (const nv of uniqueNameVariants) {
            for (const nm of uniqueNums) {
                for (const sep of separators) {
                    for (const sym of symbols) {
                        if (fullList.length >= total) break outer;
                        fullList.push(nv + sep + nm + sym);
                        if (fullList.length < total) {
                            fullList.push(nm + sep + nv + sym);
                        }
                    }
                }
            }
        }
        fullList = [...new Set(fullList)];
        filename = `passwords_${data.input}.txt`;
    }

    if (fullList.length === 0) {
        alert('No data to download.');
        return;
    }

    const text = fullList.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    alert(`Download complete! ${fullList.length.toLocaleString()} items saved.`);
}

// ============================================================
// সহায়ক ফাংশন
// ============================================================
function factorial(k) {
    let r = 1;
    for (let i = 2; i <= k; i++) r *= i;
    return r;
}

function formatLargeNumber(num) {
    if (num >= 10000000) {
        return (num / 10000000).toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' কোটি (' + num.toLocaleString() + ')';
    } else if (num >= 100000) {
        return (num / 100000).toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' লক্ষ (' + num.toLocaleString() + ')';
    } else if (num >= 1000) {
        return (num / 1000).toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' হাজার (' + num.toLocaleString() + ')';
    }
    return num.toLocaleString();
}

function permuteString(str) {
    const results = [];
    const permute = (arr, current) => {
        if (results.length >= 50) return;
        if (arr.length === 0) {
            results.push(current.join(''));
            return;
        }
        for (let i = 0; i < arr.length; i++) {
            const rest = arr.slice(0, i).concat(arr.slice(i + 1));
            permute(rest, current.concat(arr[i]));
        }
    };
    permute(str.split(''), []);
    return [...new Set(results)];
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}