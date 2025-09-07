async function searchBatter(inputId, prefix) {
    const name = document.getElementById(inputId).value.trim();
    if (!name) return;

    const playerId = await getPlayerIdByName(name);
    if (playerId) {
        await getBatterStats(playerId, prefix);
        highlightStats();
    }
}

async function searchPitcher(inputId, prefix) {
    const name = document.getElementById(inputId).value.trim();
    if (!name) return;

    const playerId = await getPlayerIdByName(name);
    if (playerId) {
        await getPitcherStats(playerId, prefix);
        highlightStats();
    }
}

async function getPlayerIdByName(name) {
    const url = `https://statsapi.mlb.com/api/v1/people/search?names=${encodeURIComponent(name)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.people && data.people.length > 0) {
        return data.people[0].id; // first match
    } else {
        alert(`Player not found: ${name}`);
        return null;
    }
}

async function getBatterStats(playerId, prefix) {
    const res = await fetch(
        `https://statsapi.mlb.com/api/v1/people/${playerId}?hydrate=stats(group=[hitting,pitching],type=[season])`
    );
    const data = await res.json();

    const player = data.people[0];
    if (player.stats && Array.isArray(player.stats)) {
        hitting = player.stats.find(s => s.group.displayName === "hitting"); // checks if it's a batter
    } else {
        alert(`No stats for this player: ${player.fullName}`);
    }
    
    if (hitting) {
        const stats = hitting.splits[0].stat; // get actual numbers
        
        document.getElementById(`${prefix}-img`).src = `https://img.mlbstatic.com/mlb-photos/image/upload/w_200,q_auto:best/v1/people/${playerId}/headshot/67/current`;
        document.getElementById(`${prefix}-name`).textContent = player.fullName;
        document.getElementById(`${prefix}-avg`).textContent = stats.avg;
        document.getElementById(`${prefix}-hr`).textContent = stats.homeRuns;
        document.getElementById(`${prefix}-rbi`).textContent = stats.rbi;
        document.getElementById(`${prefix}-obp`).textContent = stats.obp;
        document.getElementById(`${prefix}-slg`).textContent = stats.slg;
        document.getElementById(`${prefix}-ops`).textContent = stats.ops;
        // document.getElementById(`${prefix}-war`).textContent = stats.war;
    } else {
        alert("You need to search for batters!");
        return null;
    }

    highlightStats();
}

async function getPitcherStats(playerId, prefix) {
    const res = await fetch(
        `https://statsapi.mlb.com/api/v1/people/${playerId}?hydrate=stats(group=[hitting,pitching],type=[season])`
    );
    const data = await res.json();

    const player = data.people[0];
    
    if (player.stats && Array.isArray(player.stats)) {
        pitching = player.stats.find(s => s.group.displayName === "pitching"); // checks if it's a pitcher
    } else {
        alert(`No stats for this player: ${player.fullName}`);
    }
    
    if (pitching) {
        const stats = pitching.splits[0].stat; // get actual numbers
        
        document.getElementById(`${prefix}-img`).src = `https://img.mlbstatic.com/mlb-photos/image/upload/w_200,q_auto:best/v1/people/${playerId}/headshot/67/current`;
        document.getElementById(`${prefix}-name`).textContent = player.fullName;
        document.getElementById(`${prefix}-era`).textContent = stats.era;
        document.getElementById(`${prefix}-wins`).textContent = stats.wins;
        document.getElementById(`${prefix}-whip`).textContent = stats.whip;
        document.getElementById(`${prefix}-ip`).textContent = stats.inningsPitched;
        document.getElementById(`${prefix}-ks`).textContent = stats.strikeOuts;
        document.getElementById(`${prefix}-baa`).textContent = stats.avg;
        // document.getElementById(`${prefix}-war`).textContent = stats.war;
    } else {
        alert("You need to search for pitchers!");
        return null;
    }

    highlightStats();
}

function highlightStats() {
    const rows = document.querySelectorAll(".stat-row:not(.stat-header)");

    rows.forEach(row => {
        const cells = row.querySelectorAll("div");

        // only process if row has 3 cells
        if (cells.length === 3) {
        const left = parseFloat(cells[0].textContent);
        const right = parseFloat(cells[2].textContent);
        const statName = cells[1].textContent.trim().toLowerCase(); // trim removes white space

        // remove highlights
        cells[0].classList.remove("highlight");
        cells[2].classList.remove("highlight");

        if (!isNaN(left) && !isNaN(right)) {
            let better = "higher";

            if (["era", "whip", "baa"].includes(statName)) {
            better = "lower";
            }

            if (better === "higher") {
            if (left > right) {
                cells[0].classList.add("highlight");
            } else if (right > left) {
                cells[2].classList.add("highlight");
            }} else if (better === "lower") {
            if (left < right) {
                cells[0].classList.add("highlight");
            } else if (right < left) {
                cells[2].classList.add("highlight");
            }
            }
        }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname.toLowerCase();
    
    if (path.includes("batters")) {
        loadTopBatters();
    } else if (path.includes("pitchers")) {
        loadTopPitchers();
    }
});

async function loadTopBatters() {
    const currentSeason = new Date().getFullYear();
    const res = await fetch(`https://statsapi.mlb.com/api/v1/stats/leaders?leaderCategories=homeRuns&season=${currentSeason}&sportId=1`);
    const data = await res.json();
    const leaders = data.leagueLeaders[0].leaders;

    if (leaders.length >= 2) {
        await getBatterStats(leaders[0].person.id, "p1");
        await getBatterStats(leaders[1].person.id, "p2");
    }
}

async function loadTopPitchers() {
    const currentSeason = new Date().getFullYear();
    const res = await fetch(`https://statsapi.mlb.com/api/v1/stats/leaders?leaderCategories=ERA&season=${currentSeason}&sportId=1`);
    const data = await res.json();
    const leaders = data.leagueLeaders[0].leaders;

    if (leaders.length >= 2) {
        await getPitcherStats(leaders[0].person.id, "p1");
        await getPitcherStats(leaders[1].person.id, "p2");
    }
}