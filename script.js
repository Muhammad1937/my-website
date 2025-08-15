// Polyfills for older browsers
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
        'use strict';
        if (search instanceof RegExp) {
            throw TypeError('first argument must not be a RegExp');
        }
        if (start === undefined) { start = 0; }
        return this.indexOf(search, start) !== -1;
    };
}

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBjR12VrbyLOwlgrlyC29hs_snfCZKcqkA",
    authDomain: "presscountgame-858f0.firebaseapp.com",
    databaseURL: "https://presscountgame-858f0-default-rtdb.firebaseio.com",
    projectId: "presscountgame-858f0",
    storageBucket: "presscountgame-858f0.firebasestorage.app",
    messagingSenderId: "284509537288",
    appId: "1:284509537288:web:87be2ab0818e7a3891fdbd"
};

// Variables
let db = null;
let auth = null;
let isDarkMode = true;
let isSoundEnabled = true;
let currentVolume = 0.5;
let activeTouches = new Set();

// Audio context for creating sounds
let audioContext = null;

// All Countries List
const countries = [
    {code: 'AF', name: 'AFGHANISTAN', flag: '🇦🇫'},
    {code: 'AL', name: 'ALBANIA', flag: '🇦🇱'},
    {code: 'DZ', name: 'ALGERIA', flag: '🇩🇿'},
    {code: 'AD', name: 'ANDORRA', flag: '🇦🇩'},
    {code: 'AO', name: 'ANGOLA', flag: '🇦🇴'},
    {code: 'AG', name: 'ANTIGUA AND BARBUDA', flag: '🇦🇬'},
    {code: 'AR', name: 'ARGENTINA', flag: '🇦🇷'},
    {code: 'AM', name: 'ARMENIA', flag: '🇦🇲'},
    {code: 'AU', name: 'AUSTRALIA', flag: '🇦🇺'},
    {code: 'AT', name: 'AUSTRIA', flag: '🇦🇹'},
    {code: 'AZ', name: 'AZERBAIJAN', flag: '🇦🇿'},
    {code: 'BS', name: 'BAHAMAS', flag: '🇧🇸'},
    {code: 'BH', name: 'BAHRAIN', flag: '🇧🇭'},
    {code: 'BD', name: 'BANGLADESH', flag: '🇧🇩'},
    {code: 'BB', name: 'BARBADOS', flag: '🇧🇧'},
    {code: 'BY', name: 'BELARUS', flag: '🇧🇾'},
    {code: 'BE', name: 'BELGIUM', flag: '🇧🇪'},
    {code: 'BZ', name: 'BELIZE', flag: '🇧🇿'},
    {code: 'BJ', name: 'BENIN', flag: '🇧🇯'},
    {code: 'BT', name: 'BHUTAN', flag: '🇧🇹'},
    {code: 'BO', name: 'BOLIVIA', flag: '🇧🇴'},
    {code: 'BA', name: 'BOSNIA AND HERZEGOVINA', flag: '🇧🇦'},
    {code: 'BW', name: 'BOTSWANA', flag: '🇧🇼'},
    {code: 'BR', name: 'BRAZIL', flag: '🇧🇷'},
    {code: 'BN', name: 'BRUNEI', flag: '🇧🇳'},
    {code: 'BG', name: 'BULGARIA', flag: '🇧🇬'},
    {code: 'BF', name: 'BURKINA FASO', flag: '🇧🇫'},
    {code: 'BI', name: 'BURUNDI', flag: '🇧🇮'},
    {code: 'CV', name: 'CABO VERDE', flag: '🇨🇻'},
    {code: 'KH', name: 'CAMBODIA', flag: '🇰🇭'},
    {code: 'CM', name: 'CAMEROON', flag: '🇨🇲'},
    {code: 'CA', name: 'CANADA', flag: '🇨🇦'},
    {code: 'CF', name: 'CENTRAL AFRICAN REPUBLIC', flag: '🇨🇫'},
    {code: 'TD', name: 'CHAD', flag: '🇹🇩'},
    {code: 'CL', name: 'CHILE', flag: '🇨🇱'},
    {code: 'CN', name: 'CHINA', flag: '🇨🇳'},
    {code: 'CO', name: 'COLOMBIA', flag: '🇨🇴'},
    {code: 'KM', name: 'COMOROS', flag: '🇰🇲'},
    {code: 'CG', name: 'CONGO', flag: '🇨🇬'},
    {code: 'CD', name: 'CONGO (DRC)', flag: '🇨🇩'},
    {code: 'CR', name: 'COSTA RICA', flag: '🇨🇷'},
    {code: 'CI', name: 'CÔTE D\'IVOIRE', flag: '🇨🇮'},
    {code: 'HR', name: 'CROATIA', flag: '🇭🇷'},
    {code: 'CU', name: 'CUBA', flag: '🇨🇺'},
    {code: 'CY', name: 'CYPRUS', flag: '🇨🇾'},
    {code: 'CZ', name: 'CZECH REPUBLIC', flag: '🇨🇿'},
    {code: 'DK', name: 'DENMARK', flag: '🇩🇰'},
    {code: 'DJ', name: 'DJIBOUTI', flag: '🇩🇯'},
    {code: 'DM', name: 'DOMINICA', flag: '🇩🇲'},
    {code: 'DO', name: 'DOMINICAN REPUBLIC', flag: '🇩🇴'},
    {code: 'EC', name: 'ECUADOR', flag: '🇪🇨'},
    {code: 'EG', name: 'EGYPT', flag: '🇪🇬'},
    {code: 'SV', name: 'EL SALVADOR', flag: '🇸🇻'},
    {code: 'GQ', name: 'EQUATORIAL GUINEA', flag: '🇬🇶'},
    {code: 'ER', name: 'ERITREA', flag: '🇪🇷'},
    {code: 'EE', name: 'ESTONIA', flag: '🇪🇪'},
    {code: 'SZ', name: 'ESWATINI', flag: '🇸🇿'},
    {code: 'ET', name: 'ETHIOPIA', flag: '🇪🇹'},
    {code: 'FJ', name: 'FIJI', flag: '🇫🇯'},
    {code: 'FI', name: 'FINLAND', flag: '🇫🇮'},
    {code: 'FR', name: 'FRANCE', flag: '🇫🇷'},
    {code: 'GA', name: 'GABON', flag: '🇬🇦'},
    {code: 'GM', name: 'GAMBIA', flag: '🇬🇲'},
    {code: 'GE', name: 'GEORGIA', flag: '🇬🇪'},
    {code: 'DE', name: 'GERMANY', flag: '🇩🇪'},
    {code: 'GH', name: 'GHANA', flag: '🇬🇭'},
    {code: 'GR', name: 'GREECE', flag: '🇬🇷'},
    {code: 'GD', name: 'GRENADA', flag: '🇬🇩'},
    {code: 'GT', name: 'GUATEMALA', flag: '🇬🇹'},
    {code: 'GN', name: 'GUINEA', flag: '🇬🇳'},
    {code: 'GW', name: 'GUINEA-BISSAU', flag: '🇬🇼'},
    {code: 'GY', name: 'GUYANA', flag: '🇬🇾'},
    {code: 'HT', name: 'HAITI', flag: '🇭🇹'},
    {code: 'HN', name: 'HONDURAS', flag: '🇭🇳'},
    {code: 'HU', name: 'HUNGARY', flag: '🇭🇺'},
    {code: 'IS', name: 'ICELAND', flag: '🇮🇸'},
    {code: 'IN', name: 'INDIA', flag: '🇮🇳'},
    {code: 'ID', name: 'INDONESIA', flag: '🇮🇩'},
    {code: 'IR', name: 'IRAN', flag: '🇮🇷'},
    {code: 'IQ', name: 'IRAQ', flag: '🇮🇶'},
    {code: 'IE', name: 'IRELAND', flag: '🇮🇪'},
    {code: 'IL', name: 'ISRAEL', flag: '🇮🇱'},
    {code: 'IT', name: 'ITALY', flag: '🇮🇹'},
    {code: 'JM', name: 'JAMAICA', flag: '🇯🇲'},
    {code: 'JP', name: 'JAPAN', flag: '🇯🇵'},
    {code: 'JO', name: 'JORDAN', flag: '🇯🇴'},
    {code: 'KZ', name: 'KAZAKHSTAN', flag: '🇰🇿'},
    {code: 'KE', name: 'KENYA', flag: '🇰🇪'},
    {code: 'KI', name: 'KIRIBATI', flag: '🇰🇮'},
    {code: 'KP', name: 'NORTH KOREA', flag: '🇰🇵'},
    {code: 'KR', name: 'SOUTH KOREA', flag: '🇰🇷'},
    {code: 'XK', name: 'KOSOVO', flag: '🇽🇰'},
    {code: 'KW', name: 'KUWAIT', flag: '🇰🇼'},
    {code: 'KG', name: 'KYRGYZSTAN', flag: '🇰🇬'},
    {code: 'LA', name: 'LAOS', flag: '🇱🇦'},
    {code: 'LV', name: 'LATVIA', flag: '🇱🇻'},
    {code: 'LB', name: 'LEBANON', flag: '🇱🇧'},
    {code: 'LS', name: 'LESOTHO', flag: '🇱🇸'},
    {code: 'LR', name: 'LIBERIA', flag: '🇱🇷'},
    {code: 'LY', name: 'LIBYA', flag: '🇱🇾'},
    {code: 'LI', name: 'LIECHTENSTEIN', flag: '🇱🇮'},
    {code: 'LT', name: 'LITHUANIA', flag: '🇱🇹'},
    {code: 'LU', name: 'LUXEMBOURG', flag: '🇱🇺'},
    {code: 'MG', name: 'MADAGASCAR', flag: '🇲🇬'},
    {code: 'MW', name: 'MALAWI', flag: '🇲🇼'},
    {code: 'MY', name: 'MALAYSIA', flag: '🇲🇾'},
    {code: 'MV', name: 'MALDIVES', flag: '🇲🇻'},
    {code: 'ML', name: 'MALI', flag: '🇲🇱'},
    {code: 'MT', name: 'MALTA', flag: '🇲🇹'},
    {code: 'MH', name: 'MARSHALL ISLANDS', flag: '🇲🇭'},
    {code: 'MR', name: 'MAURITANIA', flag: '🇲🇷'},
    {code: 'MU', name: 'MAURITIUS', flag: '🇲🇺'},
    {code: 'MX', name: 'MEXICO', flag: '🇲🇽'},
    {code: 'FM', name: 'MICRONESIA', flag: '🇫🇲'},
    {code: 'MD', name: 'MOLDOVA', flag: '🇲🇩'},
    {code: 'MC', name: 'MONACO', flag: '🇲🇨'},
    {code: 'MN', name: 'MONGOLIA', flag: '🇲🇳'},
    {code: 'ME', name: 'MONTENEGRO', flag: '🇲🇪'},
    {code: 'MA', name: 'MOROCCO', flag: '🇲🇦'},
    {code: 'MZ', name: 'MOZAMBIQUE', flag: '🇲🇿'},
    {code: 'MM', name: 'MYANMAR', flag: '🇲🇲'},
    {code: 'NA', name: 'NAMIBIA', flag: '🇳🇦'},
    {code: 'NR', name: 'NAURU', flag: '🇳🇷'},
    {code: 'NP', name: 'NEPAL', flag: '🇳🇵'},
    {code: 'NL', name: 'NETHERLANDS', flag: '🇳🇱'},
    {code: 'NZ', name: 'NEW ZEALAND', flag: '🇳🇿'},
    {code: 'NI', name: 'NICARAGUA', flag: '🇳🇮'},
    {code: 'NE', name: 'NIGER', flag: '🇳🇪'},
    {code: 'NG', name: 'NIGERIA', flag: '🇳🇬'},
    {code: 'MK', name: 'NORTH MACEDONIA', flag: '🇲🇰'},
    {code: 'NO', name: 'NORWAY', flag: '🇳🇴'},
    {code: 'OM', name: 'OMAN', flag: '🇴🇲'},
    {code: 'PK', name: 'PAKISTAN', flag: '🇵🇰'},
    {code: 'PW', name: 'PALAU', flag: '🇵🇼'},
    {code: 'PS', name: 'PALESTINE', flag: '🇵🇸'},
    {code: 'PA', name: 'PANAMA', flag: '🇵🇦'},
    {code: 'PG', name: 'PAPUA NEW GUINEA', flag: '🇵🇬'},
    {code: 'PY', name: 'PARAGUAY', flag: '🇵🇾'},
    {code: 'PE', name: 'PERU', flag: '🇵🇪'},
    {code: 'PH', name: 'PHILIPPINES', flag: '🇵🇭'},
    {code: 'PL', name: 'POLAND', flag: '🇵🇱'},
    {code: 'PT', name: 'PORTUGAL', flag: '🇵🇹'},
    {code: 'QA', name: 'QATAR', flag: '🇶🇦'},
    {code: 'RO', name: 'ROMANIA', flag: '🇷🇴'},
    {code: 'RU', name: 'RUSSIA', flag: '🇷🇺'},
    {code: 'RW', name: 'RWANDA', flag: '🇷🇼'},
    {code: 'KN', name: 'SAINT KITTS AND NEVIS', flag: '🇰🇳'},
    {code: 'LC', name: 'SAINT LUCIA', flag: '🇱🇨'},
    {code: 'VC', name: 'SAINT VINCENT AND THE GRENADINES', flag: '🇻🇨'},
    {code: 'WS', name: 'SAMOA', flag: '🇼🇸'},
    {code: 'SM', name: 'SAN MARINO', flag: '🇸🇲'},
    {code: 'ST', name: 'SAO TOME AND PRINCIPE', flag: '🇸🇹'},
    {code: 'SA', name: 'SAUDI ARABIA', flag: '🇸🇦'},
    {code: 'SN', name: 'SENEGAL', flag: '🇸🇳'},
    {code: 'RS', name: 'SERBIA', flag: '🇷🇸'},
    {code: 'SC', name: 'SEYCHELLES', flag: '🇸🇨'},
    {code: 'SL', name: 'SIERRA LEONE', flag: '🇸🇱'},
    {code: 'SG', name: 'SINGAPORE', flag: '🇸🇬'},
    {code: 'SK', name: 'SLOVAKIA', flag: '🇸🇰'},
    {code: 'SI', name: 'SLOVENIA', flag: '🇸🇮'},
    {code: 'SB', name: 'SOLOMON ISLANDS', flag: '🇸🇧'},
    {code: 'SO', name: 'SOMALIA', flag: '🇸🇴'},
    {code: 'ZA', name: 'SOUTH AFRICA', flag: '🇿🇦'},
    {code: 'SS', name: 'SOUTH SUDAN', flag: '🇸🇸'},
    {code: 'ES', name: 'SPAIN', flag: '🇪🇸'},
    {code: 'LK', name: 'SRI LANKA', flag: '🇱🇰'},
    {code: 'SD', name: 'SUDAN', flag: '🇸🇩'},
    {code: 'SR', name: 'SURINAME', flag: '🇸🇷'},
    {code: 'SE', name: 'SWEDEN', flag: '🇸🇪'},
    {code: 'CH', name: 'SWITZERLAND', flag: '🇨🇭'},
    {code: 'SY', name: 'SYRIA', flag: '🇸🇾'},
    {code: 'TW', name: 'TAIWAN', flag: '🇹🇼'},
    {code: 'TJ', name: 'TAJIKISTAN', flag: '🇹🇯'},
    {code: 'TZ', name: 'TANZANIA', flag: '🇹🇿'},
    {code: 'TH', name: 'THAILAND', flag: '🇹🇭'},
    {code: 'TL', name: 'TIMOR-LESTE', flag: '🇹🇱'},
    {code: 'TG', name: 'TOGO', flag: '🇹🇬'},
    {code: 'TO', name: 'TONGA', flag: '🇹🇴'},
    {code: 'TT', name: 'TRINIDAD AND TOBAGO', flag: '🇹🇹'},
    {code: 'TN', name: 'TUNISIA', flag: '🇹🇳'},
    {code: 'TR', name: 'TURKEY', flag: '🇹🇷'},
    {code: 'TM', name: 'TURKMENISTAN', flag: '🇹🇲'},
    {code: 'TV', name: 'TUVALU', flag: '🇹🇻'},
    {code: 'UG', name: 'UGANDA', flag: '🇺🇬'},
    {code: 'UA', name: 'UKRAINE', flag: '🇺🇦'},
    {code: 'AE', name: 'UNITED ARAB EMIRATES', flag: '🇦🇪'},
    {code: 'GB', name: 'UNITED KINGDOM', flag: '🇬🇧'},
    {code: 'US', name: 'UNITED STATES', flag: '🇺🇸'},
    {code: 'UY', name: 'URUGUAY', flag: '🇺🇾'},
    {code: 'UZ', name: 'UZBEKISTAN', flag: '🇺🇿'},
    {code: 'VU', name: 'VANUATU', flag: '🇻🇺'},
    {code: 'VA', name: 'VATICAN CITY', flag: '🇻🇦'},
    {code: 'VE', name: 'VENEZUELA', flag: '🇻🇪'},
    {code: 'VN', name: 'VIETNAM', flag: '🇻🇳'},
    {code: 'YE', name: 'YEMEN', flag: '🇾🇪'},
    {code: 'ZM', name: 'ZAMBIA', flag: '🇿🇲'},
    {code: 'ZW', name: 'ZIMBABWE', flag: '🇿🇼'}
];

// Game Variables
let clickCount = 0;
let timeLeft = 15;
let gameStarted = false;
let countdownInterval;
let gameInterval;
let userData = {};
let currentUser = null;
let leaderboard = [];
let playerCountListener = null;

// Pages Content
const pagesContent = {
    privacy: {
        title: 'PRIVACY POLICY',
        content: `
            <h3>INFORMATION WE COLLECT</h3>
            <p>We collect minimal personal information including your chosen username and country selection. This data is stored securely in our Firebase database and is used solely for displaying leaderboard rankings.</p>
            
            <h3>HOW WE USE YOUR DATA</h3>
            <p>Your information is used to maintain game rankings, display your scores on the leaderboard, and provide you with your personal statistics. We do not share your data with third parties.</p>
            
            <h3>DATA STORAGE</h3>
            <p>All data is stored securely on Firebase servers. You can request deletion of your data at any time by contacting our support team.</p>
            
            <h3>COOKIES AND LOCAL STORAGE</h3>
            <p>We use browser local storage to remember your game preferences (theme, sound settings) and user ID for convenience. This data remains on your device.</p>
        `
    },
    about: {
        title: 'ABOUT US',
        content: `
            <h3>WELCOME TO CLICK CHALLENGE</h3>
            <p>Click Challenge is a competitive clicking game where players from around the world compete to achieve the highest click count in 15 seconds.</p>
            
            <h3>OUR MISSION</h3>
            <p>We aim to provide a fun, competitive gaming experience that brings players together from all corners of the globe. Our simple yet addictive gameplay creates moments of excitement and friendly competition.</p>
            
            <h3>HOW IT WORKS</h3>
            <p>Players have 15 seconds to click as fast as possible. Your score is recorded and ranked against players worldwide. Can you reach the top of the global leaderboard?</p>
            
            <h3>CONTACT US</h3>
            <p>For support, feedback, or inquiries, please reach out through our official channels.</p>
        `
    },
    terms: {
        title: 'TERMS OF USE',
        content: `
            <h3>ACCEPTANCE OF TERMS</h3>
            <p>By using Click Challenge, you agree to these terms of use. If you do not agree, please do not use our service.</p>
            
            <h3>FAIR PLAY</h3>
            <p>Users must play fairly without using automated tools, scripts, or any form of cheating. Violations may result in score removal and account suspension.</p>
            
            <h3>USER CONDUCT</h3>
            <p>Users must choose appropriate usernames that are not offensive, misleading, or inappropriate. We reserve the right to remove any content that violates our community standards.</p>
            
            <h3>INTELLECTUAL PROPERTY</h3>
            <p>All content, design, and functionality of Click Challenge are protected by intellectual property laws. Users may not copy, modify, or distribute our content without permission.</p>
            
            <h3>LIMITATION OF LIABILITY</h3>
            <p>Click Challenge is provided "as is" without warranties. We are not liable for any damages arising from the use of our service.</p>
        `
    }
};

// Initialize Audio Context
function initAudioContext() {
    if (!audioContext) {
        // Check for AudioContext support
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioContext = new AudioContextClass();
        }
    }
}

// Play soft click sound
function playClickSound() {
    if (!isSoundEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 1000;
        
        filter.type = 'lowpass';
        filter.frequency.value = 1500;
        
        gainNode.gain.value = currentVolume * 0.1;
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Play countdown sound
function playCountdownSound() {
    if (!isSoundEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 600;
        
        gainNode.gain.value = currentVolume * 0.3;
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Play start sound
function playStartSound() {
    if (!isSoundEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
        
        gainNode.gain.value = currentVolume * 0.4;
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Play end sound
function playEndSound() {
    if (!isSoundEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
        
        gainNode.gain.value = currentVolume * 0.5;
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Play button sound
function playButtonSound() {
    if (!isSoundEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 500;
        
        gainNode.gain.value = currentVolume * 0.2;
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Toggle Sound
function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    const soundIcon = document.getElementById('soundIcon');
    const soundToggle = document.getElementById('soundToggle');
    const volumeControl = document.getElementById('volumeControl');
    
    if (isSoundEnabled) {
        soundIcon.textContent = '🔊';
        soundToggle.classList.remove('muted');
        volumeControl.classList.add('show');
        if (!audioContext) {
            initAudioContext();
        }
    } else {
        soundIcon.textContent = '🔇';
        soundToggle.classList.add('muted');
        volumeControl.classList.remove('show');
    }
    
    // Use try-catch for localStorage
    try {
        localStorage.setItem('clickGameSound', isSoundEnabled);
    } catch (e) {
        console.log('localStorage not available');
    }
    
    // Hide volume control after 3 seconds
    if (isSoundEnabled) {
        setTimeout(function() {
            volumeControl.classList.remove('show');
        }, 3000);
    }
}

// Update Volume
function updateVolume() {
    currentVolume = document.getElementById('volumeSlider').value / 100;
    try {
        localStorage.setItem('clickGameVolume', currentVolume);
    } catch (e) {
        console.log('localStorage not available');
    }
}

// Initialize Audio
function initAudio() {
    // Load saved sound preferences
    try {
        const savedSound = localStorage.getItem('clickGameSound');
        const savedVolume = localStorage.getItem('clickGameVolume');
        
        if (savedSound === 'false') {
            isSoundEnabled = false;
            document.getElementById('soundIcon').textContent = '🔇';
            document.getElementById('soundToggle').classList.add('muted');
        }
        
        if (savedVolume) {
            currentVolume = parseFloat(savedVolume);
            document.getElementById('volumeSlider').value = currentVolume * 100;
        }
    } catch (e) {
        console.log('localStorage not available');
    }
}

// Theme Management
function initTheme() {
    try {
        const savedTheme = localStorage.getItem('clickGameTheme');
        if (savedTheme === 'light') {
            isDarkMode = false;
            document.body.classList.add('light-mode');
            document.getElementById('themeToggle').classList.add('active');
            document.getElementById('themeIcon').textContent = '☀️';
        }
    } catch (e) {
        console.log('localStorage not available');
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    if (isDarkMode) {
        document.body.classList.remove('light-mode');
        themeToggle.classList.remove('active');
        themeIcon.textContent = '🌙';
        try {
            localStorage.setItem('clickGameTheme', 'dark');
        } catch (e) {}
    } else {
        document.body.classList.add('light-mode');
        themeToggle.classList.add('active');
        themeIcon.textContent = '☀️';
        try {
            localStorage.setItem('clickGameTheme', 'light');
        } catch (e) {}
    }
    
    playButtonSound();
}

// Create Animated Particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Load Countries
function loadCountries() {
    const select = document.getElementById('userCountry');
    countries.forEach(function(country) {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = country.flag + ' ' + country.name;
        select.appendChild(option);
    });
}

// Initialize Firebase Auth
async function initializeAuth() {
    try {
        await auth.signInAnonymously();
        console.log('Connected to Firebase');
        return true;
    } catch (error) {
        console.error('Auth error:', error);
        return false;
    }
}

// Check existing user
async function checkExistingUser() {
    try {
        const savedUserId = localStorage.getItem('clickGameUserId');
        
        if (savedUserId) {
            try {
                const userDoc = await db.collection('users').doc(savedUserId).get();
                if (userDoc.exists) {
                    userData = userDoc.data();
                    currentUser = savedUserId;
                    document.getElementById('loginScreen').style.display = 'none';
                    document.getElementById('mainScreen').style.display = 'block';
                    document.getElementById('onlineIndicator').style.display = 'flex';
                    document.getElementById('playerCount').style.display = 'block';
                    document.getElementById('themeToggle').style.display = 'flex';
                    document.getElementById('soundToggle').style.display = 'flex';
                    document.getElementById('newPlayerBtn').style.display = 'block';
                    loadLeaderboard();
                    updatePlayerCount();
                    
                    // Initialize audio context if sound is enabled
                    if (isSoundEnabled) {
                        initAudioContext();
                    }
                    
                    return true;
                }
            } catch (error) {
                console.error('Error checking user:', error);
            }
        }
    } catch (e) {
        console.log('localStorage not available');
    }
    return false;
}

// New Player Function
function newPlayer() {
    playButtonSound();
    try {
        localStorage.removeItem('clickGameUserId');
    } catch (e) {}
    currentUser = null;
    userData = {};
    document.getElementById('mainScreen').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('newPlayerBtn').style.display = 'none';
    document.getElementById('userName').value = '';
    document.getElementById('userCountry').value = '';
}

// Update player count
function updatePlayerCount() {
    if (playerCountListener) playerCountListener();
    
    playerCountListener = db.collection('online_players')
        .onSnapshot(function(snapshot) {
            const count = snapshot.size;
            document.getElementById('playerCountText').textContent = 
                count + ' PLAYER' + (count !== 1 ? 'S' : '') + ' ONLINE';
        });

    // Mark this player as online
    if (currentUser) {
        db.collection('online_players').doc(currentUser).set({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            name: userData.name,
            country: userData.country
        });

        // Remove from online when disconnecting
        window.addEventListener('beforeunload', function() {
            db.collection('online_players').doc(currentUser).delete();
        });
    }
}

// Load Leaderboard from Firebase
async function loadLeaderboard() {
    try {
        const snapshot = await db.collection('scores')
            .orderBy('clicks', 'desc')
            .limit(100)
            .get();
        
        leaderboard = [];
        snapshot.forEach(function(doc) {
            const data = doc.data();
            leaderboard.push({
                id: doc.id,
                name: data.name,
                country: data.country,
                clicks: data.clicks,
                timestamp: data.timestamp
            });
        });

        updateLeaderboardDisplay();
        updateMyRank();
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        showError('FAILED TO LOAD LEADERBOARD');
    }
}

// Update Leaderboard Display
function updateLeaderboardDisplay() {
    const container = document.getElementById('top5Ranks');
    
    if (leaderboard.length === 0) {
        container.innerHTML = 
            '<div class="empty-state">' +
            '<div class="empty-state-icon">🎮</div>' +
            '<div class="empty-state-text">BE THE FIRST TO PLAY!</div>' +
            '</div>';
        return;
    }
    
    container.innerHTML = '';
    const top5 = leaderboard.slice(0, 5);
    top5.forEach(function(player, index) {
        const country = countries.find(function(c) { return c.code === player.country; });
        const rankDiv = document.createElement('div');
        rankDiv.className = 'rank-item rank-' + (index + 1);
        rankDiv.innerHTML = 
            '<span>' + (index + 1) + '. ' + player.name + ' ' + (country ? country.flag : '') + '</span>' +
            '<span>' + player.clicks + ' CLICKS</span>';
        container.appendChild(rankDiv);
    });
}

// Update My Rank
function updateMyRank() {
    if (currentUser) {
        const myRank = leaderboard.findIndex(function(p) { return p.id === currentUser; }) + 1;
        document.getElementById('myRankDisplay').textContent = myRank || '-';
    }
}

// Show Error
function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    setTimeout(function() {
        errorEl.style.display = 'none';
    }, 3000);
}

// Start Game
async function startGame() {
    const name = document.getElementById('userName').value.trim().toUpperCase();
    const country = document.getElementById('userCountry').value;
    
    if (!name || !country) {
        showError('PLEASE ENTER YOUR NAME AND SELECT YOUR COUNTRY');
        return;
    }
    
    playButtonSound();
    userData = {name: name, country: country};
    
    try {
        // Create or update user in Firebase
        if (!currentUser) {
            const userRef = await db.collection('users').add({
                name: name,
                country: country,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            currentUser = userRef.id;
            try {
                localStorage.setItem('clickGameUserId', currentUser);
            } catch (e) {}
        }
        
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainScreen').style.display = 'block';
        document.getElementById('onlineIndicator').style.display = 'flex';
        document.getElementById('playerCount').style.display = 'block';
        document.getElementById('themeToggle').style.display = 'flex';
        document.getElementById('soundToggle').style.display = 'flex';
        document.getElementById('newPlayerBtn').style.display = 'block';
        
        updatePlayerCount();
        loadLeaderboard();
        
        // Initialize audio context if sound is enabled
        if (isSoundEnabled) {
            initAudioContext();
        }
    } catch (error) {
        console.error('Error creating user:', error);
        showError('CONNECTION ERROR. PLEASE TRY AGAIN.');
    }
}

// Handle Click on Start Button
function handleClick(event) {
    if (!gameStarted) {
        playButtonSound();
        document.getElementById('mainScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'flex';
        startCountdown();
    }
}

// Setup game screen for multi-touch
function setupGameScreen() {
    const gameScreen = document.getElementById('gameScreen');
    
    // Mouse events
    gameScreen.addEventListener('mousedown', function(e) {
        e.preventDefault();
        if (gameStarted && timeLeft > 0) {
            registerClick(e);
        }
    });
    
    // Touch events for multi-touch support
    gameScreen.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (gameStarted && timeLeft > 0) {
            // Process all touches
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (!activeTouches.has(touch.identifier)) {
                    activeTouches.add(touch.identifier);
                    registerClick(touch);
                }
            }
        }
    });
    
    gameScreen.addEventListener('touchend', function(e) {
        e.preventDefault();
        // Remove ended touches
        for (let i = 0; i < e.changedTouches.length; i++) {
            activeTouches.delete(e.changedTouches[i].identifier);
        }
    });
    
    gameScreen.addEventListener('touchcancel', function(e) {
        e.preventDefault();
        // Remove cancelled touches
        for (let i = 0; i < e.changedTouches.length; i++) {
            activeTouches.delete(e.changedTouches[i].identifier);
        }
    });
}

// Register a click
function registerClick(event) {
    clickCount++;
    const counter = document.getElementById('clickCounter');
    counter.textContent = clickCount;
    counter.style.animation = 'none';
    setTimeout(function() {
        counter.style.animation = 'counter-pulse 0.3s ease-out';
    }, 10);
    
    createClickEffect(event);
    playClickSound();
}

// Create Click Effect
function createClickEffect(e) {
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    
    const x = e.clientX || e.pageX;
    const y = e.clientY || e.pageY;
    
    effect.style.left = (x - 15) + 'px';
    effect.style.top = (y - 15) + 'px';
    
    document.body.appendChild(effect);
    setTimeout(function() { effect.remove(); }, 600);
}

// Start Countdown
function startCountdown() {
    gameStarted = false;
    activeTouches.clear();
    let countdown = 3;
    document.getElementById('countdown').style.display = 'block';
    document.getElementById('countdown').textContent = countdown;
    
    countdownInterval = setInterval(function() {
        countdown--;
        if (countdown > 0) {
            const countdownEl = document.getElementById('countdown');
            countdownEl.textContent = countdown;
            countdownEl.style.animation = 'none';
            setTimeout(function() {
                countdownEl.style.animation = 'zoomInOut 1s ease-out';
            }, 10);
            playCountdownSound();
        } else {
            clearInterval(countdownInterval);
            startClickGame();
        }
    }, 1000);
}

// Start Click Game
function startClickGame() {
    gameStarted = true;
    document.getElementById('countdown').style.display = 'none';
    document.getElementById('timer').style.display = 'block';
    document.getElementById('clickCounter').style.display = 'block';
    
    playStartSound();
    
    gameInterval = setInterval(function() {
        timeLeft -= 0.1;
        document.getElementById('timer').textContent = timeLeft.toFixed(1) + 'S';
        
        if (timeLeft <= 3) {
            document.getElementById('timer').style.color = '#ff6b6b';
        }
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 100);
}

// End Game
async function endGame() {
    clearInterval(gameInterval);
    gameStarted = false;
    activeTouches.clear();
    
    playEndSound();
    
    try {
        // Save score to Firebase
        await db.collection('scores').doc(currentUser).set({
            userId: currentUser,
            name: userData.name,
            country: userData.country,
            clicks: clickCount,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Reload leaderboard to get updated ranking
        await loadLeaderboard();
        
        // Find player rank
        const playerRank = leaderboard.findIndex(function(p) { return p.id === currentUser; }) + 1;
        
        showResult(playerRank);
    } catch (error) {
        console.error('Error saving score:', error);
        showError('ERROR SAVING SCORE');
    }
}

// Show Result
function showResult(rank) {
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'block';
    
    document.getElementById('finalRank').textContent = '#' + (rank || '-');
    document.getElementById('rankText').textContent = rank || '-';
    document.getElementById('totalClicks').textContent = clickCount;
}

// Play Again
function playAgain() {
    playButtonSound();
    clickCount = 0;
    timeLeft = 15;
    gameStarted = false;
    activeTouches.clear();
    
    document.getElementById('resultScreen').style.display = 'none';
    document.getElementById('mainScreen').style.display = 'block';
    document.getElementById('timer').style.display = 'none';
    document.getElementById('timer').style.color = '#f093fb';
    document.getElementById('clickCounter').style.display = 'none';
    document.getElementById('clickCounter').textContent = '0';
    document.getElementById('timer').textContent = '15.0S';
    
    loadLeaderboard();
}

// View All Ranks
async function viewAllRanks() {
    playButtonSound();
    document.getElementById('allRanksModal').style.display = 'block';
    const listContainer = document.getElementById('allRanksList');
    listContainer.innerHTML = '<div class="loader"></div>';
    
    try {
        await loadLeaderboard();
        
        if (leaderboard.length === 0) {
            listContainer.innerHTML = 
                '<div class="empty-state">' +
                '<div class="empty-state-icon">🎮</div>' +
                '<div class="empty-state-text">NO PLAYERS YET!</div>' +
                '</div>';
            return;
        }
        
        listContainer.innerHTML = '';
        leaderboard.forEach(function(player, index) {
            const country = countries.find(function(c) { return c.code === player.country; });
            const rankDiv = document.createElement('div');
            rankDiv.className = 'rank-item ' + (index < 3 ? 'rank-' + (index + 1) : '');
            rankDiv.innerHTML = 
                '<span>' + (index + 1) + '. ' + player.name + ' ' + (country ? country.flag : '') + '</span>' +
                '<span>' + player.clicks + ' CLICKS</span>';
            listContainer.appendChild(rankDiv);
        });
    } catch (error) {
        listContainer.innerHTML = '<p style="color: #ff6b6b;">FAILED TO LOAD RANKINGS</p>';
    }
}

// Close Modal
function closeModal() {
    playButtonSound();
    document.getElementById('allRanksModal').style.display = 'none';
}

// Show My Rank - Updated
async function showMyRank() {
    if (!currentUser) {
        alert('PLEASE LOGIN FIRST!');
        return;
    }

    playButtonSound();
    
    const modal = document.getElementById('myRankModal');
    const loadingDiv = document.getElementById('rankLoadingDiv');
    const contentDiv = document.getElementById('rankContentDiv');
    
    modal.style.display = 'block';
    loadingDiv.style.display = 'block';
    contentDiv.style.display = 'none';
    
    try {
        await loadLeaderboard();
        
        loadingDiv.style.display = 'none';
        contentDiv.style.display = 'block';
        
        const myRank = leaderboard.findIndex(function(p) { return p.id === currentUser; }) + 1;
        const myData = leaderboard.find(function(p) { return p.id === currentUser; });
        
        if (myRank === 0 || !myData) {
            document.getElementById('myRankNumber').textContent = '#-';
            document.getElementById('myRankDetails').textContent = 'YOU HAVEN\'T PLAYED YET!';
            document.getElementById('myRankStats').style.display = 'none';
            document.getElementById('rankMedal').textContent = '🎮';
        } else {
            document.getElementById('myRankNumber').textContent = '#' + myRank;
            
            // Set medal based on rank
            let medal = '';
            if (myRank === 1) medal = '🥇';
            else if (myRank === 2) medal = '🥈';
            else if (myRank === 3) medal = '🥉';
            else if (myRank <= 10) medal = '🏆';
            else medal = '🎯';
            
            document.getElementById('rankMedal').textContent = medal;
            
            const country = countries.find(function(c) { return c.code === myData.country; });
            document.getElementById('myRankDetails').textContent = 
                myData.name + ' ' + (country ? country.flag : '');
            
            document.getElementById('myRankStats').style.display = 'block';
            document.getElementById('bestScore').textContent = myData.clicks + ' CLICKS';
            document.getElementById('playersAhead').textContent = myRank > 1 ? myRank - 1 : 0;
            document.getElementById('totalPlayers').textContent = leaderboard.length;
        }
    } catch (error) {
        console.error('Error loading rank:', error);
        loadingDiv.style.display = 'none';
        contentDiv.style.display = 'block';
        document.getElementById('myRankNumber').textContent = 'ERROR';
        document.getElementById('myRankDetails').textContent = 'FAILED TO LOAD RANK';
        document.getElementById('myRankStats').style.display = 'none';
        document.getElementById('rankMedal').textContent = '⚠️';
    }
}

// Close My Rank Modal
function closeMyRankModal() {
    playButtonSound();
    document.getElementById('myRankModal').style.display = 'none';
}

// Show Page Content
function showPage(page) {
    playButtonSound();
    const content = pagesContent[page];
    if (content) {
        document.getElementById('pageTitle').textContent = content.title;
        document.getElementById('pageContent').innerHTML = content.content;
        document.getElementById('pagesModal').style.display = 'block';
    }
}

// Close Pages Modal
function closePagesModal() {
    playButtonSound();
    document.getElementById('pagesModal').style.display = 'none';
}

// Initialize
window.onload = async function() {
    initTheme();
    initAudio();
    createParticles();
    loadCountries();
    setupGameScreen();
    
    // Volume slider event
    document.getElementById('volumeSlider').addEventListener('input', updateVolume);
    
    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        
        // Try to connect
        const connected = await initializeAuth();
        
        if (!connected) {
            throw new Error('Failed to connect to Firebase');
        }
        
        // Check for existing user
        const hasUser = await checkExistingUser();
        
        document.getElementById('loadingScreen').style.display = 'none';
        
        if (!hasUser) {
            document.getElementById('loginScreen').style.display = 'block';
            document.getElementById('themeToggle').style.display = 'flex';
            document.getElementById('soundToggle').style.display = 'flex';
        }
    } catch (error) {
        console.error('Initialization error:', error);
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('errorScreen').style.display = 'flex';
    }
};

// Handle window close
window.addEventListener('beforeunload', function() {
    if (currentUser) {
        db.collection('online_players').doc(currentUser).delete();
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('myRankModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
    
    const pagesModal = document.getElementById('pagesModal');
    if (event.target == pagesModal) {
        pagesModal.style.display = 'none';
    }
};

// Enable sound on first user interaction
document.addEventListener('click', function() {
    if (isSoundEnabled && !audioContext) {
        initAudioContext();
    }
}, { once: true });