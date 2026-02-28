import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, collection, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

if ('wakeLock' in navigator) {
    navigator.wakeLock.request('screen').catch(() => {});
}

const firebaseConfig = {
  apiKey: "AIzaSyB3DgeOTZMHClqzRsKuhnxBVDNaVUq9RHk",
  authDomain: "gold-clicker-bf955.firebaseapp.com",
  projectId: "gold-clicker-bf955",
  storageBucket: "gold-clicker-bf955.firebasestorage.app",
  messagingSenderId: "44920202750",
  appId: "1:44920202750:web:d827228faaf585d72d4caf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let score = 0;
let clickPower = 1;
let autoRate = 0;
let clickUpgradeCost = 50;
let autoUpgradeCost = 100;
let clickUpgradeLevel = 0;
let autoBought = false;
let lastClick = 0;
let playerName = '';

const scoreEl = document.getElementById('score');
const perClickEl = document.getElementById('per-click');
const coin = document.getElementById('coin');
const clickCostEl = document.getElementById('upgrade-click-cost');
const autoCostEl = document.getElementById('upgrade-auto-cost');

playerName = prompt('Kullanıcı adını gir:') || 'Anonim';

coin.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastClick < 1000) return;
    lastClick = now;
    score += clickPower;
    updateUI();
    saveScore();
});

document.getElementById('upgrade-click').addEventListener('click', () => {
    if (score >= clickUpgradeCost) {
        score -= clickUpgradeCost;
        clickPower++;
        clickUpgradeLevel++;
        clickUpgradeCost = Math.floor(clickUpgradeCost * 1.8);
        updateUI();
        saveScore();
    }
});

document.getElementById('upgrade-auto').addEventListener('click', () => {
    if (!autoBought && score >= autoUpgradeCost) {
        score -= autoUpgradeCost;
        autoRate = 1;
        autoBought = true;
        document.getElementById('upgrade-auto').style.opacity = '0.5';
        document.getElementById('upgrade-auto').style.cursor = 'default';
        updateUI();
        saveScore();
    }
});

setInterval(() => {
    if (autoRate > 0) {
        score += autoRate;
        updateUI();
        saveScore();
    }
}, 1000);

function updateUI() {
    scoreEl.textContent = `Puan: ${score.toLocaleString()}`;
    perClickEl.textContent = `Her tıkta: ${clickPower} puan | Otomatik: ${autoRate}/sn`;
    clickCostEl.textContent = `💰 Maliyet: ${clickUpgradeCost.toLocaleString()} puan (Seviye ${clickUpgradeLevel})`;
    autoCostEl.textContent = autoBought ? '✅ Satın Alındı' : `💰 Maliyet: ${autoUpgradeCost.toLocaleString()} puan`;
}

async function saveScore() {
    try {
        await setDoc(doc(db, 'leaderboard', playerName), {
            name: playerName,
            score: score,
            updatedAt: new Date()
        });
    } catch (e) {
        console.error('Kayıt hatası:', e);
    }
}

const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(10));
onSnapshot(q, (snapshot) => {
    const leaderboardEl = document.getElementById('leaderboard-list');
    leaderboardEl.innerHTML = '';
    let rank = 1;
    snapshot.forEach((doc) => {
        const data = doc.data();
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.innerHTML = `<span>${rank}. ${data.name}</span><span>${data.score.toLocaleString()} 💰</span>`;
        leaderboardEl.appendChild(item);
        rank++;
    });
});