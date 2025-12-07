/**
 * Firebase-powered Character Ranking System
 * Free tier: 50K reads + 20K writes per day
 * Perfect for character rankings with global data
 */

class FirebaseRankingSystem {
    constructor() {
        this.storageKey = 'axiom-character-rankings';
        this.userIdKey = 'axiom-user-id';
        this.characters = [
            {
                id: 'ariella',
                name: 'A.R.I.E.L.L.A',
                description: 'Automated Regulation Interface, Enforcement & Logistics Android',
                category: 'Robots/Androids/Machines',
                url: '../ariella/ariella.html'
            },
            {
                id: 'aridoe',
                name: 'Ariella Non-Mech Form',
                description: 'Deersona',
                category: 'Anthropomorphs',
                url: '../aridoe/aridoe.html'
            },
            {
                id: 'darla',
                name: 'Darla',
                description: 'Ranger Of The Forest',
                category: 'Anthropomorphs',
                url: '../thea/thea.html'
            },
            {
                id: 'caelielle',
                name: 'Caelielle',
                description: 'Angellic Guardian',
                category: 'Anthropomorphs',
                url: '../caelielle/caelielle.html'
            }
        ];
        
        this.userId = this.getOrCreateUserId();
        this.userVotes = {};
        this.globalRankings = {};
        this.firebaseReady = false;
        
        this.initFirebase();
    }

    async initFirebase() {
        try {
            // Import Firebase modules
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
            const { getFirestore, collection, doc, setDoc, getDoc, getDocs, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            // Firebase configuration - REPLACE WITH YOUR CONFIG FROM FIREBASE CONSOLE
            const firebaseConfig = {
                // 🔥 PASTE YOUR FIREBASE CONFIG HERE
                // Get this from: Firebase Console > Project Settings > General > Your apps > Web app
                // Your project name: AxiomOCDatabase
                // Example format:
                // apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                // authDomain: "axiomocdatabase.firebaseapp.com",
                // projectId: "axiomocdatabase",
                // storageBucket: "axiomocdatabase.appspot.com",
                // messagingSenderId: "123456789012",
                // appId: "1:123456789012:web:xxxxxxxxxxxxxxxxx"
                
                // ⚠️ IMPORTANT: Replace this with your actual Firebase config from AxiomOCDatabase project ⚠️
                apiKey: "AIzaSyB-dsFpr790H-m020Ojubbr5I_qAMEIwiY",
                authDomain: "axiomocdatabase.firebaseapp.com",
                projectId: "axiomocdatabase",
                storageBucket: "axiomocdatabase.appspot.com",
                messagingSenderId: "849872728406",
                appId: "1:849872728406:web:cac277d51263cce20126f7",
                measurementId: "G-H2DQJGWTKQ"
            };

            // Initialize Firebase
            this.app = initializeApp(firebaseConfig);
            this.db = getFirestore(this.app);
            this.firebaseReady = true;

            // Load user votes and global rankings
            await this.loadUserVotes();
            await this.loadGlobalRankings();
            
            // Set up real-time listeners
            this.setupRealtimeListeners();
            
            console.log('🔥 Firebase connected successfully!');
            this.init();
            
        } catch (error) {
            console.warn('❌ Firebase failed to load, falling back to localStorage:', error);
            this.firebaseReady = false;
            this.fallbackToLocalStorage();
        }
    }

    fallbackToLocalStorage() {
        // Fallback to original localStorage system if Firebase fails
        this.userVotes = this.loadLocalUserVotes();
        
        // Try to load any cached global rankings from previous Firebase sessions
        const cachedGlobal = localStorage.getItem('axiom-global-rankings-cache');
        if (cachedGlobal) {
            try {
                this.globalRankings = JSON.parse(cachedGlobal);
                console.log('📦 Using cached global rankings');
            } catch (e) {
                console.warn('Failed to parse cached global rankings:', e);
                this.globalRankings = {};
            }
        } else {
            this.globalRankings = {};
        }
        
        this.init();
    }

    loadLocalUserVotes() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.warn('Failed to parse stored rankings:', e);
            }
        }
        return {};
    }

    getOrCreateUserId() {
        let userId = localStorage.getItem(this.userIdKey);
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(this.userIdKey, userId);
        }
        return userId;
    }

    async loadUserVotes() {
        // Always load localStorage first for immediate display
        this.userVotes = this.loadLocalUserVotes();
        
        if (!this.firebaseReady) return;

        try {
            const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const userDoc = await getDoc(doc(this.db, 'user_votes', this.userId));
            
            if (userDoc.exists()) {
                const firebaseVotes = userDoc.data().votes || {};
                // Merge Firebase votes with localStorage (Firebase takes precedence for conflicts)
                this.userVotes = { ...this.userVotes, ...firebaseVotes };
                // Update localStorage with merged data
                localStorage.setItem(this.storageKey, JSON.stringify(this.userVotes));
            }
        } catch (error) {
            console.warn('Failed to load user votes from Firebase:', error);
        }
    }

    async loadGlobalRankings() {
        if (!this.firebaseReady) return;

        try {
            const { getDocs, collection } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const rankingsSnapshot = await getDocs(collection(this.db, 'global_rankings'));
            
            this.globalRankings = {};
            rankingsSnapshot.forEach(doc => {
                this.globalRankings[doc.id] = doc.data();
            });
            
            // Cache global rankings for offline use
            localStorage.setItem('axiom-global-rankings-cache', JSON.stringify(this.globalRankings));
            console.log('📊 Global rankings loaded and cached');
        } catch (error) {
            console.warn('Failed to load global rankings from Firebase:', error);
        }
    }

    setupRealtimeListeners() {
        if (!this.firebaseReady) return;

        // Disable real-time updates to prevent constant refreshing
        // Global rankings will only update when user manually refreshes page
        // This prevents the ranking system from updating every time someone votes
        
        /* DISABLED - Uncomment to re-enable real-time updates
        // Listen for global ranking changes
        import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js').then(({ onSnapshot, collection }) => {
            onSnapshot(collection(this.db, 'global_rankings'), (snapshot) => {
                this.globalRankings = {};
                snapshot.forEach(doc => {
                    this.globalRankings[doc.id] = doc.data();
                });
                this.updateDisplay();
            });
        });
        */
    }

    async vote(characterId, rating) {
        if (rating < 1 || rating > 5) {
            console.warn('Invalid rating:', rating);
            return;
        }

        const oldRating = this.userVotes[characterId]?.rating || 0;
        
        this.userVotes[characterId] = {
            rating: rating,
            timestamp: Date.now()
        };

        // Always save locally for immediate feedback
        localStorage.setItem(this.storageKey, JSON.stringify(this.userVotes));
        this.updateDisplay();

        // Also save to Firebase if available
        if (this.firebaseReady) {
            try {
                // Save user vote to Firebase
                await this.saveUserVote();
                
                // Update global rankings
                await this.updateGlobalRanking(characterId, oldRating, rating);
                
                console.log(`✅ Vote saved: ${characterId} = ${rating} stars`);
            } catch (error) {
                console.error('❌ Failed to save vote to Firebase:', error);
                // Local storage already saved above, so user sees immediate feedback
            }
        }
    }

    async saveUserVote() {
        const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        await setDoc(doc(this.db, 'user_votes', this.userId), {
            votes: this.userVotes,
            lastUpdated: Date.now()
        });
    }

    async updateGlobalRanking(characterId, oldRating, newRating) {
        const { setDoc, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        // Get current global data for this character
        const globalDoc = await getDoc(doc(this.db, 'global_rankings', characterId));
        let globalData = globalDoc.exists() ? globalDoc.data() : {
            totalRating: 0,
            voteCount: 0,
            averageRating: 0
        };

        // Update the global stats
        if (oldRating > 0) {
            // Update existing vote
            globalData.totalRating = globalData.totalRating - oldRating + newRating;
        } else {
            // New vote
            globalData.totalRating += newRating;
            globalData.voteCount += 1;
        }

        globalData.averageRating = globalData.totalRating / globalData.voteCount;
        globalData.lastUpdated = Date.now();

        // Save updated global data
        await setDoc(doc(this.db, 'global_rankings', characterId), globalData);
    }

    getCharacterRating(characterId) {
        return this.userVotes[characterId]?.rating || 0;
    }

    getGlobalRating(characterId) {
        return this.globalRankings[characterId]?.averageRating || 0;
    }

    getGlobalVoteCount(characterId) {
        return this.globalRankings[characterId]?.voteCount || 0;
    }

    calculateRankings() {
        return this.characters
            .map(char => ({
                ...char,
                userRating: this.getCharacterRating(char.id),
                globalRating: this.getGlobalRating(char.id),
                globalVotes: this.getGlobalVoteCount(char.id),
                hasVoted: this.userVotes[char.id] !== undefined
            }))
            .sort((a, b) => {
                // Sort by global rating (descending), then by vote count
                if (a.globalRating !== b.globalRating) {
                    return b.globalRating - a.globalRating;
                }
                if (a.globalVotes !== b.globalVotes) {
                    return b.globalVotes - a.globalVotes;
                }
                return a.name.localeCompare(b.name);
            });
    }

    init() {
        if (this.shouldShowRankings()) {
            this.injectRankingSystem();
        }
    }

    shouldShowRankings() {
        return window.location.pathname.includes('rankings.html') || 
               document.getElementById('character-rankings') !== null;
    }

    injectRankingSystem() {
        const container = this.findOrCreateContainer();
        if (!container) return;

        container.innerHTML = this.generateRankingHTML();
        this.attachEventListeners();
    }

    findOrCreateContainer() {
        let container = document.getElementById('character-rankings');
        
        if (!container) {
            container = document.createElement('section');
            container.id = 'character-rankings';
            container.className = 'ranking-section';
            
            const mainElement = document.querySelector('main.character-sections') || document.querySelector('.ranking-main');
            if (mainElement) {
                const lastSection = mainElement.querySelector('section:last-child');
                if (lastSection) {
                    mainElement.insertBefore(container, lastSection);
                } else {
                    mainElement.appendChild(container);
                }
            } else {
                document.body.appendChild(container);
            }
        }
        
        return container;
    }

    generateRankingHTML() {
        const rankings = this.calculateRankings();
        const connectionStatus = this.firebaseReady ? 
            '<span style="color: #66e0ff;">🔥 LIVE DATA</span>' : 
            '<span style="color: #ffaa00;">📱 LOCAL DATA</span>';
        
        return `
            <div class="ranking-header">
                <h2 class="section-title">Character Rankings ${connectionStatus}</h2>
                <p class="ranking-intro">
                    <strong>BNL CREW EVALUATION SYSTEM:</strong> Rate your favorite characters on a scale of 1-5 stars. 
                    ${this.firebaseReady ? 
                        'Rankings show <strong>global averages</strong> from all visitors in real-time.' : 
                        'Rankings are stored locally. Global data unavailable.'
                    }
                    <em>Your ratings help improve the passenger experience aboard the USS Axiom.</em>
                </p>
            </div>
            
            <div class="ranking-grid">
                ${rankings.map((char, index) => this.generateCharacterRankingCard(char, index + 1)).join('')}
            </div>
            
            <div class="ranking-stats">
                <div class="stat-item">
                    <span class="stat-label">Your Ratings:</span>
                    <span class="stat-value">${rankings.filter(c => c.hasVoted).length} / ${rankings.length}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Global Average:</span>
                    <span class="stat-value">${this.calculateGlobalAverage().toFixed(1)} ⭐</span>
                </div>
                ${this.firebaseReady ? `
                <div class="stat-item">
                    <span class="stat-label">Total Votes:</span>
                    <span class="stat-value">${this.getTotalVotes()}</span>
                </div>` : ''}
            </div>
        `;
    }

    generateCharacterRankingCard(character, rank) {
        const stars = this.generateStarRating(character.id, character.userRating);
        const rankBadge = character.globalRating > 0 ? 
            `<div class="rank-badge">#${rank}</div>` : 
            '<div class="rank-badge unrated">—</div>';
        
        const globalInfo = this.firebaseReady && character.globalVotes > 0 ? 
            `<div class="global-rating">Global: ${character.globalRating.toFixed(1)} ⭐ (${character.globalVotes} votes)</div>` :
            '';
        
        return `
            <div class="ranking-card ${character.hasVoted ? 'voted' : 'unvoted'}" data-character="${character.id}">
                ${rankBadge}
                <div class="ranking-card-content">
                    <h3 class="character-name">${character.name}</h3>
                    <p class="character-desc">${character.description}</p>
                    <div class="character-category">${character.category}</div>
                    ${globalInfo}
                    <div class="rating-section">
                        <div class="stars-container" data-character="${character.id}">
                            ${stars}
                        </div>
                        <div class="rating-info">
                            ${character.hasVoted ? `Your Rating: ${character.userRating}/5` : 'Click to Rate'}
                        </div>
                    </div>
                    <a href="${character.url}" class="view-character-btn">View Character</a>
                </div>
            </div>
        `;
    }

    generateStarRating(characterId, currentRating = 0) {
        return Array.from({length: 5}, (_, i) => {
            const starValue = i + 1;
            const filled = starValue <= currentRating;
            return `<span class="star ${filled ? 'filled' : ''}" data-character="${characterId}" data-rating="${starValue}">⭐</span>`;
        }).join('');
    }

    calculateGlobalAverage() {
        const globalRatings = Object.values(this.globalRankings);
        if (globalRatings.length === 0) return 0;
        
        const totalRating = globalRatings.reduce((sum, data) => sum + (data.averageRating || 0), 0);
        return totalRating / globalRatings.length;
    }

    getTotalVotes() {
        return Object.values(this.globalRankings).reduce((sum, data) => sum + (data.voteCount || 0), 0);
    }

    attachEventListeners() {
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => {
                const characterId = e.target.dataset.character;
                const rating = parseInt(e.target.dataset.rating);
                this.vote(characterId, rating);
            });

            star.addEventListener('mouseenter', (e) => {
                this.highlightStars(e.target);
            });
        });

        document.querySelectorAll('.stars-container').forEach(container => {
            container.addEventListener('mouseleave', () => {
                this.resetStarHighlights();
            });
        });
    }

    highlightStars(targetStar) {
        const characterId = targetStar.dataset.character;
        const rating = parseInt(targetStar.dataset.rating);
        const container = targetStar.closest('.stars-container');
        
        container.querySelectorAll('.star').forEach((star, index) => {
            if (star.dataset.character === characterId) {
                star.classList.toggle('hover', index < rating);
            }
        });
    }

    resetStarHighlights() {
        document.querySelectorAll('.star').forEach(star => {
            star.classList.remove('hover');
        });
    }

    updateDisplay() {
        if (document.getElementById('character-rankings')) {
            this.injectRankingSystem();
        }
    }

    async clearAllRatings() {
        try {
            const confirmClear = await customDialogs.rankingDialog('Are you sure you want to clear all your character ratings? This action cannot be undone.', 'confirm');
            
            if (confirmClear) {
                this.userVotes = {};
                
                if (this.firebaseReady) {
                    // Note: Global data stays - only clearing personal votes
                    this.saveUserVote();
                } else {
                    localStorage.removeItem(this.storageKey);
                }
                
                this.updateDisplay();
            }
        } catch (error) {
            // User cancelled
            console.log('Clear ratings cancelled');
        }
    }

    exportRatings() {
        const data = {
            personalRatings: this.userVotes,
            globalRankings: this.globalRankings,
            firebaseConnected: this.firebaseReady,
            exportDate: new Date().toISOString(),
            userId: this.userId
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'axiom-character-rankings.json';
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.characterRanking = new FirebaseRankingSystem();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseRankingSystem;
}
