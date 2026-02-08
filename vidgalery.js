// VLOŽ SEM SVŮJ ODKAZ Z GOOGLE TABULEK (formát .csv)
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQqvio7EPnscU_rvx66THWNy75RfpFzDyi3exttD_FU4V2Px-kk3W9H9s1d_n3RQTlHHy54lIdW8X_7/pub?gid=0&single=true&output=csv";

let myVideoProjects = [];
let currentProj = 0;
let currentVid = 0;

async function loadTableData() {
    try {
        const response = await fetch(sheetURL);
        const csvText = await response.text();
        
        // Rozdělení na řádky
        const rows = csvText.split(/\r?\n/).filter(row => row.trim() !== "");
        
        // Zpracování dat bez "čínského bordelu"
        myVideoProjects = rows.slice(1).map(row => {
            // Jednodušší a bezpečnější rozdělení CSV
            const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            
            const clean = (str) => str ? str.replace(/^"|"$/g, '').trim() : "";

            return {
                title: clean(columns[0]),
                desc: clean(columns[1]),
                thumbID: clean(columns[2]),
                videos: clean(columns[3]).split(',').map(v => v.trim())
            };
        });

        // Otočení pořadí: nejnovější (poslední v tabulce) budou první na webu
        myVideoProjects.reverse(); 

        buildVidGallery();
    } catch (error) {
        console.error("Chyba při načítání dat:", error);
    }
}

function buildVidGallery() {
    const container = document.getElementById('vid-gallery-container');
    if (!container) return;
    container.innerHTML = ""; 

    myVideoProjects.forEach((proj, index) => {
        let thumbUrl;

        // Kontrola, jestli je v thumbID celá URL nebo jen kód
        if (proj.thumbID.startsWith('http')) {
            // Pokud začíná na http, je to přímý odkaz na obrázek
            thumbUrl = proj.thumbID;
        } else {
            // Jinak je to YouTube ID a složíme URL pro náhled
            thumbUrl = `https://img.youtube.com/vi/${proj.thumbID}/maxresdefault.jpg`;
        }
        
        const div = document.createElement('div');
        div.className = 'vid-gallery-item';
        div.onclick = () => openModal(index);
        div.innerHTML = `
            <img src="${thumbUrl}" alt="${proj.title}" 
                 onerror="handleImageError(this, '${proj.thumbID}')">
            <div class="vid-item-text">
                <h3>${proj.title}</h3>
                <p>${proj.desc}</p>
            </div>
        `;
        container.appendChild(div);
    });
}

// Pomocná funkce pro případ, že se obrázek nenačte
function handleImageError(img, thumbID) {
    // Pokud to bylo YouTube ID a nenašel se maxresdefault, zkusíme nižší kvalitu
    if (!thumbID.startsWith('http')) {
        img.src = `https://img.youtube.com/vi/${thumbID}/hqdefault.jpg`;
    } else {
        // Pokud selhal i přímý odkaz, dáme tam černý placeholder
        img.src = 'https://via.placeholder.com/600x400/000000/FFFFFF?text=Náhled+nenalezen';
    }
}

// Funkce openModal, updateModalContent, nextVid, prevVid a closeModal 
// zůstávají naprosto STEJNÉ jako v předchozím kódu.

window.openModal = function(index) {
    currentProj = index;
    currentVid = 0;
    updateModalContent();
    document.getElementById('videoModal').style.display = 'block';
}

function updateModalContent() {
    const proj = myVideoProjects[currentProj];
    const content = document.getElementById('modalContent');
    
    let html = `
        <div class="video-container">
            <iframe src="${proj.videos[currentVid]}?autoplay=1" allowfullscreen></iframe>
        </div>`;
    
    if (proj.videos.length > 1) {
        html += `
            <div class="w3-center w3-padding-16">
                <button class="nav-btn" onclick="prevVid()">❮ Předchozí</button>
                <span style="color:white; font-weight:500;">${currentVid + 1} / ${proj.videos.length}</span>
                <button class="nav-btn" onclick="nextVid()">Další ❯</button>
            </div>`;
    }

    content.innerHTML = html;
    document.getElementById('modalTitle').innerText = proj.title;
    document.getElementById('modalDesc').innerText = proj.desc;
}

window.nextVid = () => {
    currentVid = (currentVid + 1) % myVideoProjects[currentProj].videos.length;
    updateModalContent();
};

window.prevVid = () => {
    currentVid = (currentVid - 1 + myVideoProjects[currentProj].videos.length) % myVideoProjects[currentProj].videos.length;
    updateModalContent();
};

window.closeModal = () => {
    document.getElementById('videoModal').style.display = 'none';
    document.getElementById('modalContent').innerHTML = '';
};

// Spuštění načítání dat
document.addEventListener('DOMContentLoaded', loadTableData);