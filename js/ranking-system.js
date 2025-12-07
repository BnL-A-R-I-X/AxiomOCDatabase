/**
 * Character Ranking System for GitHub Pages
 * Uses localStorage for client-side persistence
 */

class CharacterRankingSystem {
    constructor() {
        this.storageKey = 'axiom-character-rankings';
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
        
        this.userVotes = this.loadUserVotes();
        this.init();
    }

    init() {
        // Only initialize if we're on a page that should show rankings
        if (this.shouldShowRankings()) {
            this.injectRankingSystem();
        }
    }

    shouldShowRankings() {
        // Check if we're on the OCs page or if there's a ranking container
        return window.location.pathname.includes('ocs.html') || 
               document.getElementById('character-rankings') !== null;
    }

    loadUserVotes() {
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

    saveUserVotes() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.userVotes));
    }

    vote(characterId, rating) {
        if (rating < 1 || rating > 5) {
            console.warn('Invalid rating:', rating);
            return;
        }

        this.userVotes[characterId] = {
            rating: rating,
            timestamp: Date.now()
        };
        
        this.saveUserVotes();
        this.updateDisplay();
    }

    getCharacterRating(characterId) {
        return this.userVotes[characterId]?.rating || 0;
    }

    calculateRankings() {
        return this.characters
            .map(char => ({
                ...char,
                userRating: this.getCharacterRating(char.id),
                hasVoted: this.userVotes[char.id] !== undefined
            }))
            .sort((a, b) => {
                // Sort by user rating (descending), then by name
                if (a.userRating !== b.userRating) {
                    return b.userRating - a.userRating;
                }
                return a.name.localeCompare(b.name);
            });
    }

    injectRankingSystem() {
        const container = this.findOrCreateContainer();
        if (!container) return;

        container.innerHTML = this.generateRankingHTML();
        this.attachEventListeners();
    }

    findOrCreateContainer() {
        // Look for existing container
        let container = document.getElementById('character-rankings');
        
        if (!container) {
            // Create container and inject it into the page
            container = document.createElement('section');
            container.id = 'character-rankings';
            container.className = 'ranking-section';
            
            // Find a good place to insert it
            const mainElement = document.querySelector('main.character-sections');
            if (mainElement) {
                // Insert before the last section
                const lastSection = mainElement.querySelector('section:last-child');
                if (lastSection) {
                    mainElement.insertBefore(container, lastSection);
                } else {
                    mainElement.appendChild(container);
                }
            } else {
                // Fallback: append to body
                document.body.appendChild(container);
            }
        }
        
        return container;
    }

    generateRankingHTML() {
        const rankings = this.calculateRankings();
        
        return `
            <div class="ranking-header">
                <h2 class="section-title">Character Rankings</h2>
                <p class="ranking-intro">
                    <strong>BNL CREW EVALUATION SYSTEM:</strong> Rate your favorite characters on a scale of 1-5 stars. 
                    Rankings are stored locally and will persist across sessions. 
                    <em>Your ratings help improve the passenger experience aboard the USS Axiom.</em>
                </p>
            </div>
            
            <div class="ranking-grid">
                ${rankings.map((char, index) => this.generateCharacterRankingCard(char, index + 1)).join('')}
            </div>
            
            <div class="ranking-stats">
                <div class="stat-item">
                    <span class="stat-label">Characters Rated:</span>
                    <span class="stat-value">${rankings.filter(c => c.hasVoted).length} / ${rankings.length}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Average Rating:</span>
                    <span class="stat-value">${this.calculateAverageRating().toFixed(1)} ⭐</span>
                </div>
            </div>
        `;
    }

    generateCharacterRankingCard(character, rank) {
        const stars = this.generateStarRating(character.id, character.userRating);
        const rankBadge = character.userRating > 0 ? `<div class="rank-badge">#${rank}</div>` : '<div class="rank-badge unrated">—</div>';
        
        return `
            <div class="ranking-card ${character.hasVoted ? 'voted' : 'unvoted'}" data-character="${character.id}">
                ${rankBadge}
                <div class="ranking-card-content">
                    <h3 class="character-name">${character.name}</h3>
                    <p class="character-desc">${character.description}</p>
                    <div class="character-category">${character.category}</div>
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

    calculateAverageRating() {
        const ratings = Object.values(this.userVotes).map(v => v.rating);
        if (ratings.length === 0) return 0;
        return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    }

    attachEventListeners() {
        // Add click listeners to stars
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

        // Add hover effects to star containers
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

    // Public method to clear all ratings
    async clearAllRatings() {
        try {
            const confirmClear = await customDialogs.rankingDialog('Are you sure you want to clear all your character ratings? This action cannot be undone.', 'confirm');
            
            if (confirmClear) {
                localStorage.removeItem(this.storageKey);
                this.userVotes = {};
                this.updateDisplay();
            }
        } catch (error) {
            // User cancelled
            console.log('Clear ratings cancelled');
        }
    }

    // Public method to export ratings
    exportRatings() {
        const data = {
            ratings: this.userVotes,
            exportDate: new Date().toISOString(),
            characters: this.characters.length
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
    window.characterRanking = new CharacterRankingSystem();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CharacterRankingSystem;
}
