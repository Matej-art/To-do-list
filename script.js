const categories = {
    zdraví: { 
        name: "Zdraví & Sport", 
        icon: "fa-person-running", 
        color: "#10b981", 
        options: [
            "2x týdně 20 min rychlá chůze nebo běh venku", 
            "3x týdně 15 min protažení na pokoji (mobilita a záda)", 
            "1x týdně posilování s vlastní vahou (kliky, dřepy, břicho)",
            "Každý den vynechat slazené nápoje a energetické drinky",
            "Každý den hlídat si pitný režim (vypít min. 2 litry čisté vody)"
        ] 
    },
    škola: { 
        name: "Škola & Studium", 
        icon: "fa-book", 
        color: "#3b82f6", 
        options: [
            "2x týdně 30 min procvičování matematiky / programování", 
            "Každý den připravit si učebnice a věci na stůl na zítřek předem", 
            "Každý den učit se v studijním klidu bez rušení mobilem (Režim Nerušit)",
            "2x týdně 30 min vypracovávat otázku na maturitu",
            "Každý den průběžná příprava na nejbližší zkoušení nebo test"
        ] 
    },
    osobní: { 
        name: "Osobní & Pokoj", 
        icon: "fa-bullseye", 
        color: "#8b5cf6", 
        options: [
            "2x týdně 30 min práce na svém osobním projektu", 
            "Každý den uklidit si kompletně stůl a pracovní plochu", 
            "Každý den věnovat se 30 min svému oblíbenému koníčku (kreslení, hudba, hry)",
            "Každý večer si udělat pořádek na pokoji (vyhodit odpadky, srovnat židli)",
            "Každý den vypnout sociální sítě 1 hodinu před spaním"
        ] 
    },
    práce: { 
        name: "Práce & Finance", 
        icon: "fa-briefcase", 
        color: "#f59e0b", 
        options: [
            "1x týdně zkontrolovat výdaje a stav peněženky / účtu", 
            "1x týdně odložit si stranou malou finanční rezervu (třeba i pár stovek)", 
            "1x týdně vytvořit si přehled příjmů a výdajů",
            "Každý den nenakupovat zbytečné impulzivní věci v kantýně",
            "1x týdně promyslet si možnosti přivýdělku nebo brigády"
        ] 
    },
    rozvoj: { 
        name: "Osobní rozvoj & Mysl", 
        icon: "fa-brain", 
        color: "#ec4899", 
        options: [
            "4x týdně 15 min čtení knížky (rozvojová, sci-fi, odborná)", 
            "Každý večer napsat si 3 věci, za které jsem dnes vděčný", 
            "Každý den 10 minut meditace, klidu nebo zápisu myšlenek do deníku",
            "Každý den poslechnout si inspirativní podcast nebo vzdělávací přednášku",
            "Každý den vyhnout se stěžování si a negativním myšlenkám"
        ] 
    }
};

const motivationalQuotes = [
    "„Úspěch je součet malých snah opakovaných den za dnem.“",
    "„Nikdy neodkládej na zítřek to, co můžeš udělat dnes.“",
    "„Na intru vyhrává ten, kdo má svůj den pevně v rukou.“",
    "„Každý krok vpřed, byť malý, tě přibližuje k cíli.“",
    "„Tvoje budoucnost je tvořena tím, co děláš dnes, ne zítra.“"
];

let appData = JSON.parse(localStorage.getItem("intrPlanDataV35")) || {
    fixedBlocks: [
        { id: 1, title: "🏫 Dopolední škola", time: "07:45 - 13:05", cat: "škola", days: [1,2,3,4,5] },
        { id: 2, title: "📖 Studijní klid na intru", time: "18:00 - 19:00", cat: "škola", days: [1,2,3,4] }
    ],
    weeklyGoals: {},
    longTermGoals: [],
    quickTasks: {},
    masterPlan: {},
    history: {},
    completedVisions: [],
    categoryStats: { škola: 0, zdraví: 0, osobní: 0, práce: 0, rozvoj: 0 },
    totalMinutesDone: 0,
    sickDays: {},
    profileName: "Student na intru",
    profileRole: "3. ročník",
    customMotto: "",
    customWeeklyOptions: { zdraví: [], škola: [], osobní: [], práce: [], rozvoj: [] }
};

function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

function initApp() {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    document.getElementById("current-date-text").textContent = new Date().toLocaleDateString('cs-CS', options).toUpperCase();

    const quoteText = appData.customMotto && appData.customMotto.trim() !== "" 
        ? `„${appData.customMotto}“` 
        : motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    document.getElementById("daily-quote-text").textContent = quoteText;

    const todayStr = getTodayString();
    const isSick = appData.sickDays && appData.sickDays[todayStr];
    const sickBtn = document.getElementById("sick-day-btn");
    if (sickBtn) {
        sickBtn.style.background = isSick ? "#10b981" : "#334155";
        sickBtn.textContent = isSick ? "✓ Den omluven (Nemoc)" : "🛌 Volno / Nemoc";
    }

    const todayObj = new Date();
    const dayOfWeek = todayObj.getDay();

    const banner = document.getElementById("ritual-banner-container");
    const dailyView = document.getElementById("daily-content-view");

    generateDistributedSchedule();

    if (dayOfWeek === 0 && (!appData.weeklyGoals || Object.keys(appData.weeklyGoals).length === 0)) {
        banner.classList.remove("hidden");
        dailyView.classList.add("hidden");
    } else {
        banner.classList.add("hidden");
        dailyView.classList.remove("hidden");
        renderAgenda();
    }
}

window.forceRefreshDay = function() {
    generateDistributedSchedule();
    renderAgenda();
    alert("Dnešní den byl aktualizován!");
};

window.toggleSickDay = function() {
    const todayStr = getTodayString();
    if (!appData.sickDays) appData.sickDays = {};
    appData.sickDays[todayStr] = !appData.sickDays[todayStr];
    
    localStorage.setItem("intrPlanDataV35", JSON.stringify(appData));
    initApp();
};

window.openDayPresetModal = function() {
    document.getElementById("preset-modal").classList.remove("hidden");
};
window.closeDayPresetModal = function() {
    document.getElementById("preset-modal").classList.add("hidden");
};

window.applyPreset = function(type) {
    const todayStr = getTodayString();
    let presetTasks = [];

    if (type === 'domu') {
        presetTasks = [
            { id: 991, time: "14:00 - 15:00", cat: "osobní", text: "🎒 Sbalit si věci na víkend domů", completed: false, fixed: true, duration: 60 },
            { id: 992, time: "15:00 - 16:30", cat: "osobní", text: "🚆 Cesta domů", completed: false, fixed: true, duration: 90 }
        ];
    } else if (type === 'volno') {
        presetTasks = [
            { id: 993, time: "10:00 - 11:00", cat: "zdraví", text: "🧘 Ranní protažení a klidné snídaně", completed: false, fixed: true, duration: 60 },
            { id: 994, time: "14:00 - 16:00", cat: "osobní", text: "🎮 Čas na koníčky a relax", completed: false, fixed: true, duration: 120 }
        ];
    } else if (type === 'intrak') {
        generateDistributedSchedule();
        closeDayPresetModal();
        renderAgenda();
        alert("Načten standardní den na intru!");
        return;
    }

    appData.masterPlan[todayStr] = presetTasks;
    localStorage.setItem("intrPlanDataV35", JSON.stringify(appData));
    closeDayPresetModal();
    renderAgenda();
    alert("Šablona dne byla úspěšně nahrána!");
};

window.saveProfileSettings = function() {
    appData.profileName = document.getElementById("profile-input-name").value || "Student na intru";
    appData.profileRole = document.getElementById("profile-input-role").value || "";
    appData.customMotto = document.getElementById("profile-input-motto").value || "";
    
    localStorage.setItem("intrPlanDataV35", JSON.stringify(appData));
    alert("Profil byl úspěšně uložen!");
    initApp();
};

window.exportData = function() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "intrplan_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
};

window.importData = function(event) {
    const fileReader = new FileReader();
    if (event.target.files[0]) {
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = function(e) {
            try {
                const parsed = JSON.parse(e.target.result);
                appData = parsed;
                localStorage.setItem("intrPlanDataV35", JSON.stringify(appData));
                alert("Data byla úspěšně importována!");
                location.reload();
            } catch (err) {
                alert("Chyba při čtení souboru: Neplatný formát JSON.");
            }
        };
    }
};

const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        tabContents.forEach(tab => tab.classList.remove('active'));

        item.classList.add('active');
        document.getElementById(`tab-${item.getAttribute('data-tab')}`).classList.add('active');

        if (item.getAttribute('data-tab') === 'tyden') renderWeekView();
        if (item.getAttribute('data-tab') === 'statistiky') renderStats();
        if (item.getAttribute('data-tab') === 'cile') renderBlocksAndVision();
        if (item.getAttribute('data-tab') === 'profil') {
            document.getElementById("profile-input-name").value = appData.profileName || "";
            document.getElementById("profile-input-role").value = appData.profileRole || "";
            document.getElementById("profile-input-motto").value = appData.customMotto || "";
            
            updateCategoryAndMinutesStats();
            const totalDoneAll = Object.values(appData.history).reduce((a,b)=>a+b,0);
            document.getElementById("profile-total-done").textContent = totalDoneAll;
            document.getElementById("profile-total-visions").textContent = appData.completedVisions ? appData.completedVisions.length : 0;
            document.getElementById("profile-total-mins").textContent = `${appData.totalMinutesDone} min`;
        }
    });
});

// Generování úkolů – rozpozná frekvenci pro rozvrh, ale z textu ji pro zobrazení odstraní
function getGeneratedTasksForDay(dayOfWeek, dateStr) {
    let tasks = [];
    let counter = 1;

    if (!appData.sickDays || !appData.sickDays[dateStr]) {
        if (appData.fixedBlocks) {
            appData.fixedBlocks.forEach(b => {
                if (!b.days || b.days.length === 0 || b.days.includes(dayOfWeek)) {
                    tasks.push({ id: counter++, time: b.time, cat: b.cat, text: b.title, completed: false, fixed: true, duration: 30 });
                }
            });
        }

        let allGoals = [];
        if (appData.weeklyGoals) {
            Object.keys(appData.weeklyGoals).forEach(catKey => {
                const goalsList = appData.weeklyGoals[catKey];
                if (goalsList) goalsList.forEach(g => allGoals.push({ cat: catKey, text: g }));
            });
        }

        if (allGoals.length > 0) {
            const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

            allGoals.forEach((g, index) => {
                let targetDays = [];
                let textLower = g.text.toLowerCase();

                if (textLower.includes("každý večer") || textLower.includes("každý den") || textLower.includes("denně")) {
                    targetDays = [0, 1, 2, 3, 4, 5, 6];
                } else if (textLower.includes("4x týdně")) {
                    targetDays = [0, 2, 4, 5];
                } else if (textLower.includes("3x týdně")) {
                    targetDays = [0, 2, 4];
                } else if (textLower.includes("2x týdně")) {
                    targetDays = [1, 3];
                } else if (textLower.includes("1x týdně")) {
                    targetDays = [5];
                } else {
                    targetDays = [dayIndex];
                }

                if (targetDays.includes(dayIndex)) {
                    let duration = 30;
                    const matchMin = g.text.match(/(\d+)\s*min/i);
                    if (matchMin) {
                        duration = parseInt(matchMin[1], 10);
                    }

                    let startTime = "13:30";
                    let endTimeMin = 13 * 60 + 30 + duration;

                    if (textLower.includes("každý večer") || textLower.includes("vděčný") || textLower.includes("meditace") || textLower.includes("před spaním")) {
                        startTime = "20:30";
                        endTimeMin = 20 * 60 + 30 + duration;
                    } else if (g.cat === 'zdraví') {
                        startTime = "14:00";
                        endTimeMin = 14 * 60 + duration;
                    } else if (g.cat === 'škola') {
                        startTime = "19:00";
                        endTimeMin = 19 * 60 + duration;
                    } else if (g.cat === 'osobní') {
                        startTime = "15:00";
                        endTimeMin = 15 * 60 + duration;
                    } else if (g.cat === 'rozvoj') {
                        startTime = "16:30";
                        endTimeMin = 16 * 60 + duration;
                    } else {
                        const timesPool = ["13:30", "15:30", "16:30"];
                        startTime = timesPool[index % timesPool.length];
                        const [sh, sm] = startTime.split(':').map(Number);
                        endTimeMin = sh * 60 + sm + duration;
                    }

                    const endHour = String(Math.floor(endTimeMin / 60)).padStart(2, '0');
                    const endMinute = String(endTimeMin % 60).padStart(2, '0');
                    const timeStr = `${startTime} - ${endHour}:${endMinute}`;

                    // Očištění textu pro denní a týdenní přehled (odstraní frekvence na začátku)
                    let cleanText = g.text
                        .replace(/^\d+x\s*týdně\s*/i, '')
                        .replace(/^každý\s*den\s*/i, '')
                        .replace(/^každý\s*večer\s*/i, '');

                    tasks.push({ 
                        id: counter++, 
                        time: timeStr, 
                        cat: g.cat, 
                        text: `🎯 ${cleanText}`, 
                        completed: false, 
                        fixed: false,
                        duration: duration
                    });
                }
            });
        }
    } else {
        tasks.push({ id: 999, time: "Celý den", cat: "zdraví", text: "🛌 Klidový režim / Zotavení z nemoci", completed: true, fixed: true, duration: 0 });
    }

    if (appData.quickTasks && appData.quickTasks[dateStr]) {
        appData.quickTasks[dateStr].forEach(qt => {
            tasks.push({ id: qt.id, time: qt.time, cat: qt.cat || 'osobní', text: `⚡ ${qt.text}`, completed: qt.completed, fixed: false, duration: 30 });
        });
    }

    return tasks;
}

function generateDistributedSchedule() {
    const todayStr = getTodayString();
    const todayObj = new Date();
    const dayOfWeek = todayObj.getDay();

    let tasks = getGeneratedTasksForDay(dayOfWeek, todayStr);

    if (appData.masterPlan[todayStr]) {
        const oldTasks = appData.masterPlan[todayStr];
        tasks.forEach(t => {
            const found = oldTasks.find(o => o.text === t.text && o.time === t.time);
            if (found) t.completed = found.completed;
        });
    }

    appData.masterPlan[todayStr] = tasks;
}

function renderAgenda() {
    const container = document.getElementById("agenda-container");
    container.innerHTML = "";

    const todayStr = getTodayString();
    if (!appData.masterPlan[todayStr]) generateDistributedSchedule();

    const tasks = appData.masterPlan[todayStr] || [];
    let completedCount = tasks.filter(t => t.completed).length;

    const groups = {};
    tasks.forEach(t => {
        if (!groups[t.time]) groups[t.time] = [];
        groups[t.time].push(t);
    });

    Object.keys(groups).sort().forEach(timeStr => {
        const groupTasks = groups[timeStr];
        const isDual = groupTasks.length > 1;

        let groupDiv = document.createElement("div");
        groupDiv.className = "time-slot-group";

        let itemsHtml = `<div class="time-slot-header"><i class="fa-regular fa-clock"></i> ${timeStr}</div>`;
        itemsHtml += `<div class="time-slot-items ${isDual ? 'grid-dual' : ''}">`;

        groupTasks.forEach(item => {
            const cat = categories[item.cat] || { name: item.cat, color: "#3b82f6", icon: "fa-circle" };
            itemsHtml += `
                <div class="agenda-card ${item.completed ? 'completed' : ''}" style="border-left-color: ${cat.color}">
                    <div class="agenda-card-top">
                        <span style="color: ${cat.color}"><i class="fa-solid ${cat.icon}"></i> ${cat.name}</span>
                        <div style="display: flex; gap: 4px;">
                            <button class="btn-small" style="background: #334155; padding: 2px 6px; font-size: 0.65rem;" onclick="postponeTask(${item.id})" title="Odložit na zítra">➡️</button>
                            <button class="btn-small" style="background: ${item.completed ? '#10b981' : '#334155'}; padding: 2px 6px; font-size: 0.65rem;" onclick="toggleTask(${item.id})">
                                ${item.completed ? '✓' : '☐'}
                            </button>
                        </div>
                    </div>
                    <div class="agenda-card-title">${item.text}</div>
                </div>
            `;
        });
        itemsHtml += `</div>`;
        groupDiv.innerHTML = itemsHtml;
        container.appendChild(groupDiv);
    });

    appData.history[todayStr] = completedCount;
    updateCategoryAndMinutesStats();
    localStorage.setItem("intrPlanDataV35", JSON.stringify(appData));

    document.getElementById("missions-status-text").textContent = `Splněno úkolů: ${completedCount} / ${tasks.length}`;
    const totalDoneAll = Object.values(appData.history).reduce((a,b)=>a+b,0);
    document.getElementById("global-streak").textContent = `🔥 ${totalDoneAll} SPLNĚNÝCH`;
}

window.postponeTask = function(id) {
    const todayStr = getTodayString();
    const tasks = appData.masterPlan[todayStr];
    if (!tasks) return;

    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const taskToMove = tasks[taskIndex];
    tasks.splice(taskIndex, 1);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (!appData.quickTasks[tomorrowStr]) appData.quickTasks[tomorrowStr] = [];
    appData.quickTasks[tomorrowStr].push({
        id: Date.now(),
        text: taskToMove.text.replace(/^[🎯⚡]\s*/, ''),
        cat: taskToMove.cat,
        time: taskToMove.time,
        completed: false
    });

    localStorage.setItem("intrPlanDataV35", JSON.stringify(appData));
    renderAgenda();
    alert("Úkol byl úspěšně odložen na zítra!");
};

function updateCategoryAndMinutesStats() {
    let catCounts = { škola: 0, zdraví: 0, osobní: 0, práce: 0, rozvoj: 0 };
    let totalMins = 0;

    Object.keys(appData.masterPlan).forEach(dateStr => {
        (appData.masterPlan[dateStr] || []).forEach(t => {
            if (t.completed) {
                if (catCounts[t.cat] !== undefined) catCounts[t.cat]++;
                totalMins += (t.duration !== undefined ? t.duration : 30);
            }
        });
    });

    appData.categoryStats = catCounts;
    appData.totalMinutesDone = totalMins;
}

function renderWeekView() {
    const container = document.getElementById("week-columns-container");
    container.innerHTML = "";

    const daysMap = [
        { name: "Pondělí", dayIdx: 1 },
        { name: "Úterý", dayIdx: 2 },
        { name: "Středa", dayIdx: 3 },
        { name: "Čtvrtek", dayIdx: 4 },
        { name: "Pátek", dayIdx: 5 },
        { name: "Sobota", dayIdx: 6 },
        { name: "Neděle", dayIdx: 0 }
    ];

    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() + distanceToMonday);

    daysMap.forEach((d) => {
        let dayDate = new Date(mondayDate);
        dayDate.setDate(mondayDate.getDate() + (d.dayIdx === 0 ? 6 : d.dayIdx - 1));
        const dateStr = dayDate.toISOString().split('T')[0];

        let dayDiv = document.createElement("div");
        dayDiv.className = "week-day-column";

        let tasksHtml = `<div class="week-day-title">${d.name} <span style="font-size: 0.75rem; color: #94a3b8; font-weight: normal;">(${dayDate.toLocaleDateString('cs-CS', {day: 'numeric', month: 'numeric'})})</span></div><div class="week-day-tasks">`;
        
        let dayTasks = getGeneratedTasksForDay(d.dayIdx, dateStr);
        dayTasks.sort((a, b) => a.time.localeCompare(b.time));

        if (dayTasks.length === 0) {
            tasksHtml += `<span style="font-size: 0.75rem; color: #64748b;">Žádné úkoly ani bloky</span>`;
        } else {
            dayTasks.forEach(t => {
                const cat = categories[t.cat] || { color: "#3b82f6" };
                tasksHtml += `
                    <div style="background: #0f172a; padding: 8px; border-radius: 8px; border-left: 3px solid ${cat.color}; font-size: 0.8rem; margin-bottom: 4px;">
                        <span style="color: #38bdf8; font-size: 0.7rem; font-weight: bold; display: block;">${t.time}</span>
                        <span style="color: #f1f5f9; font-weight: 600;">${t.text}</span>
                    </div>
                `;
            });
        }

        tasksHtml += `</div>`;
        dayDiv.innerHTML = tasksHtml;
        container.appendChild(dayDiv);
    });
}

window.toggleTask = function(id) {
    const todayStr = getTodayString();
    
    if (appData.quickTasks && appData.quickTasks[todayStr]) {
        const qt = appData.quickTasks[todayStr].find(q => q.id === id);
        if (qt) qt.completed = !qt.completed;
    }

    const tasks = appData.masterPlan[todayStr];
    if (tasks) {
        const task = tasks.find(t => t.id === id);
        if (task) task.completed = !task.completed;
    }
    localStorage.setItem("intrPlanDataV35", JSON.stringify(appData));
    renderAgenda();
};

window.openQuickTaskModal = function() {
    document.getElementById("input-qt-text").value = "";
    const select = document.getElementById("input-qt-day");
    select.innerHTML = "";
    for (let i = 0; i < 7; i++) {
        const d = new Date(); d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const label = i === 0 ? "Dnes" : (i === 1 ? "Zítra" : d.toLocaleDateString('cs-CS', { weekday: 'long', day: 'numeric', month: 'numeric' }));
        select.innerHTML += `<option value="${dateStr}">${label}</option>`;
    }
    document.getElementById("quick-task-modal").classList.remove("hidden");
};
window.closeQuickTaskModal = function() { document.getElementById("quick-task-modal").classList.add("hidden"); };

window.saveQuickTask = function() {
    const text = document.getElementById("input-qt-text").value;
    const cat = document.getElementById("input-qt-cat").value;
    const targetDate = document.getElementById("input-qt-day").value;
    const time = document.getElementById("input-qt-time").value || "16:00 - 16:30";
    if (!text) return;

    if (!appData.quickTasks[targetDate]) appData.quickTasks[targetDate] = [];
    appData.quickTasks[targetDate].push({ id: Date.now(), text, cat, time, completed: false });

    localStorage.setItem("intrPlanDataV35", JSON.stringify(appData));
    closeQuickTaskModal();
    generateDistributedSchedule();
    renderAgenda();
};

window.openBlockModal = function(id = null) {
    document.getElementById("input-block-id").value = "";
    document.getElementById("input-block-title").value = "";
    document.getElementById("input-block-time").value = "";
    document.getElementById("block-modal-title").textContent = "🏫 Pevný blok rozvrhu";
    document.querySelectorAll('input[name="block-day"]').forEach(cb => cb.checked = true);

    if (id) {
        const block = appData.fixedBlocks.find(b => b.id === id);
        if (block) {
            document.getElementById("input-block-id").value = block.id;
            document.getElementById("input-block-title").value = block.title;
            document.getElementById("input-block-time").value = block.time;
            document.getElementById("input-block-cat").value = block.cat;
            document.getElementById("block-modal-title").textContent = "✏️ Upravit pevný blok";
            document.querySelectorAll('input[name="block-day"]').forEach(cb => {
                cb.checked = block.days.includes(parseInt(cb.value));
            });
        }
    }
    document.getElementById("block-modal").classList.remove("hidden");
};
window.closeBlockModal = function() { document.getElementById("block-modal").classList.add("hidden"); };

window.saveNewBlock = function() {
    const id = document.getElementById("input-block-id").value;
    const title = document.getElementById("input-block-title").value;
    const time = document.getElementById("input-block-time").value;
    const cat = document.getElementById("input-block-cat").value;
    const selectedDays = [];
    document.querySelectorAll('input[name="block-day"]:checked').forEach(cb => selectedDays.push(parseInt(cb.value)));

    if (!title || !time) return;

    if (id) {
        const block = appData.fixedBlocks.find(b => b.id == id);
        if (block) { block.title = title; block.time = time; block.cat = cat; block.days = selectedDays; }
    } else {
        appData.fixedBlocks.push({ id: Date.now(), title, time, cat, days: selectedDays });
    }

    localStorage.setItem("intrPlanDataV35", JSON.stringify(appData));
    closeBlockModal();
    renderBlocksAndVision();
    generateDistributedSchedule();
    renderAgenda();
};

window.deleteBlock = function(id) {
    appData.fixedBlocks = appData.fixedBlocks.filter(b => b.id !== id);
    localStorage.setItem("intrPlanDataV35", JSON.stringify(appData));
    renderBlocksAndVision();
    generateDistributedSchedule();
    renderAgenda();
};

let isMandatoryRitual = false;
window.openSundayModal = function(mandatory = false) {
    isMandatoryRitual = mandatory;
    document.getElementById("modal-close-icon").style.display = mandatory ? "none" : "block";
    renderSundayModalContent();
    document.getElementById("sunday-modal").classList.remove("hidden");
};

function renderSundayModalContent() {
    const container = document.getElementById("ritual-categories-options");
    container.innerHTML = "";

    Object.keys(categories).forEach(key => {
        const cat = categories[key];
        const userSelected = appData.weeklyGoals[key] || [];
        const customList = (appData.customWeeklyOptions && appData.customWeeklyOptions[key]) || [];
        
        const allOptions = [...cat.options, ...customList];

        let accordionHtml = `
            <details class="ritual-accordion">
                <summary style="border-left: 4px solid ${cat.color};">
                    <span><i class="fa-solid ${cat.icon}" style="color: ${cat.color}; margin-right: 6px;"></i> ${cat.name}</span>
                    <i class="fa-solid fa-chevron-down" style="font-size: 0.75rem; color: #94a3b8;"></i>
                </summary>
                <div class="ritual-accordion-content">
        `;

        allOptions.forEach(opt => {
            const isChecked = userSelected.includes(opt) ? "checked" : "";
            accordionHtml += `
                <label class="ritual-option-card">
                    <input type="checkbox" name="ritual-goal-${key}" value="${opt}" ${isChecked}>
                    <span>${opt}</span>
                </label>
            `;
        });

        accordionHtml += `
            <div style="display: flex; gap: 6px; margin-top: 6px;">
                <input type="text" id="custom-input-${key}" placeholder="+ Přidat vlastní výzvu..." style="font-size: 0.8rem; padding: 6px; margin-top: 0;">
                <button type="button" class="btn-small" onclick="addCustomOption('${key}')">Přidat</button>
            </div>
        `;

        accordionHtml += `</div></details>`;
        container.innerHTML += accordionHtml;
    });
}

window.addCustomOption = function(catKey) {
    const inputEl = document.getElementById(`custom-input-${catKey}`);
    const val = inputEl.value.trim();
    if (!val) return;

    if (!appData.customWeeklyOptions) appData.customWeeklyOptions = { zdraví: [], škola: [], osobní: [], práce: [], rozvoj: [] };
    if (!appData.customWeeklyOptions[catKey]) appData.customWeeklyOptions[catKey] = [];
    
    appData.customWeeklyOptions[catKey].push(val);

    if (!appData.weeklyGoals[catKey]) appData.weeklyGoals[catKey] = [];
    appData.weeklyGoals[catKey].push(val);

    localStorage.setItem("intrPlanDataV35", JSON.stringify(appData));
    renderSundayModalContent();
};

window.closeSundayModal = function() { if (!isMandatoryRitual) document.getElementById("sunday-modal").classList.add("hidden"); };

window.saveWeeklyPlan = function() {
    let newWeeklyGoals = {};
    Object.keys(categories).forEach(key => {
        const checked = [];
        document.querySelectorAll(`input[name="ritual-goal-${key}"]:checked`).forEach(cb => checked.push(cb.value));
        newWeeklyGoals[key] = checked;
    });
    appData.weeklyGoals = newWeeklyGoals;
    generateDistributedSchedule();
    localStorage.setItem("intrPlanDataV35", JSON.stringify(appData));
    document.getElementById("sunday-modal").classList.add("hidden");
    initApp();
};

window.autoGeneratePlan = function() {
    let randomGoals = {};
    Object.keys(categories).forEach(key => {
        const opts = categories[key].options;
        randomGoals[key] = [opts[Math.floor(Math.random() * opts.length)]];
    });
    appData.weeklyGoals = randomGoals;
    generateDistributedSchedule();
    localStorage.setItem("intrPlanDataV35", JSON.stringify(appData));
    document.getElementById("sunday-modal").classList.add("hidden");
    initApp();
};

window.openLongTermModal = function() {
    document.getElementById("input-lt-title").value = "";
    document.getElementById("input-lt-deadline").value = "";
    document.getElementById("long-term-modal").classList.remove("hidden");
};
window.closeLongTermModal = function() { document.getElementById("long-term-modal").classList.add("hidden"); };

window.saveLongTermGoal = function() {
    const title = document.getElementById("input-lt-title").value;
    const cat = document.getElementById("input-lt-cat").value;
    const deadline = document.getElementById("input-lt-deadline").value;
    if (!title) return;

    appData.longTermGoals.push({ id: Date.now(), title, cat, deadline, completed: false });
    localStorage.setItem("intrPlanDataV35", JSON.stringify(appData));
    closeLongTermModal();
    renderBlocksAndVision();
};

window.toggleLongTerm = function(id) {
    const goal = appData.longTermGoals.find(g => g.id === id);
    if (goal) {
        goal.completed = !goal.completed;
        if (goal.completed) {
            if (!appData.completedVisions) appData.completedVisions = [];
            appData.completedVisions.push({ ...goal, completedDate: new Date().toLocaleDateString('cs-CS') });
            appData.longTermGoals = appData.longTermGoals.filter(g => g.id !== id);
        }
        localStorage.setItem("intrPlanDataV35", JSON.stringify(appData));
        renderBlocksAndVision();
    }
};

window.deleteLongTerm = function(id) {
    appData.longTermGoals = appData.longTermGoals.filter(g => g.id !== id);
    localStorage.setItem("intrPlanDataV35", JSON.stringify(appData));
    renderBlocksAndVision();
};

function renderBlocksAndVision() {
    const ltContainer = document.getElementById("long-term-container");
    ltContainer.innerHTML = appData.longTermGoals.length === 0 ? `<span style="font-size: 0.8rem; color: #64748b;">Žádné dlouhodobé cíle.</span>` : "";
    
    appData.longTermGoals.forEach(g => {
        const cat = categories[g.cat] || { color: "#8b5cf6" };
        let daysText = "";
        if (g.deadline) {
            const today = new Date();
            today.setHours(0,0,0,0);
            const target = new Date(g.deadline);
            const diffTime = target - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 0) daysText = `⏳ Zbývá ${diffDays} ${diffDays === 1 ? 'den' : (diffDays < 5 ? 'dny' : 'dní')}`;
            else if (diffDays === 0) daysText = `⚠️ Termín je dnes!`;
            else daysText = `❌ Termín vypršel`;
        }

        ltContainer.innerHTML += `
            <div class="stat-box-long" style="border-left: 4px solid ${cat.color}; flex-direction: row; justify-content: space-between; align-items: center; padding: 10px 14px;">
                <div>
                    <strong style="color: #f1f5f9; font-size: 0.9rem;">🎯 ${g.title}</strong>
                    <span style="color: #94a3b8; font-size: 0.75rem; display: block; margin-top: 2px;">${daysText ? daysText + ' | ' : ''}📅 ${g.deadline || 'Bez termínu'}</span>
                </div>
                <div style="display: flex; gap: 6px;">
                    <button class="btn-small" style="background: #10b981;" onclick="toggleLongTerm(${g.id})">✓</button>
                    <button class="btn-small" style="background: #ef4444;" onclick="deleteLongTerm(${g.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    });

    const visionContainer = document.getElementById("weekly-vision-container");
    visionContainer.innerHTML = "";
    Object.keys(categories).forEach(key => {
        const cat = categories[key];
        const goalsArr = appData.weeklyGoals[key] || [];
        visionContainer.innerHTML += `<div class="stat-box-long" style="border-left: 4px solid ${cat.color}"><strong style="color: ${cat.color}">${cat.name}</strong><span style="color: #f1f5f9; font-size: 0.9rem;">• ${goalsArr.join("<br>• ") || "Nenastaveno"}</span></div>`;
    });

    const daysMap = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];
    const blocksContainer = document.getElementById("blocks-list-container");
    blocksContainer.innerHTML = "";
    appData.fixedBlocks.forEach(b => {
        const cat = categories[b.cat] || { color: "#3b82f6" };
        const daysStr = b.days ? b.days.map(d => daysMap[d]).join(", ") : "Každý den";
        blocksContainer.innerHTML += `
            <div class="stat-box-long" style="border-left: 4px solid ${cat.color}; flex-direction: row; justify-content: space-between; align-items: center; padding: 10px 14px;">
                <div>
                    <strong style="color: ${cat.color}; font-size: 0.9rem;">${b.title}</strong>
                    <span style="color: #94a3b8; font-size: 0.75rem; display: block;">🕒 ${b.time} | 📅 ${daysStr}</span>
                </div>
                <div style="display: flex; gap: 4px;">
                    <button class="btn-small" style="background: #3b82f6;" onclick="openBlockModal(${b.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-small" style="background: #ef4444;" onclick="deleteBlock(${b.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    });
}

function renderStats() {
    updateCategoryAndMinutesStats();

    const historyVals = Object.values(appData.history);
    const total = historyVals.reduce((a,b)=>a+b,0);
    document.getElementById("stat-total").textContent = total;

    let streak = 0;
    for (let i = 0; i < 30; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        if ((appData.history[dateStr] || 0) > 0 || (appData.sickDays && appData.sickDays[dateStr])) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }
    document.getElementById("stat-streak-stat").textContent = `${streak} dní`;

    let thisWeekTotal = 0;
    let lastWeekTotal = 0;
    for (let i = 0; i < 7; i++) {
        const d1 = new Date(); d1.setDate(d1.getDate() - i);
        thisWeekTotal += appData.history[d1.toISOString().split('T')[0]] || 0;

        const d2 = new Date(); d2.setDate(d2.getDate() - 7 - i);
        lastWeekTotal += appData.history[d2.toISOString().split('T')[0]] || 0;
    }
    const diff = thisWeekTotal - lastWeekTotal;
    const comparisonText = diff >= 0 ? `+${diff} úkolů oproti minulému týdnu 🚀` : `${diff} úkolů oproti minulému týdnu`;

    const advContainer = document.getElementById("advanced-stats-container");
    let catHtml = `<div class="stat-box-long" style="background: #172033; border: 1px solid #334155;">
        <strong style="color: #38bdf8; margin-bottom: 6px; display: block;"><i class="fa-solid fa-chart-pie"></i> Aktivita podle kategorií</strong>
        <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 4px;">`;
    
    Object.keys(appData.categoryStats).forEach(catKey => {
        const catObj = categories[catKey] || { name: catKey, color: "#3b82f6" };
        const count = appData.categoryStats[catKey];
        catHtml += `<div style="display: flex; justify-content: space-between;"><span style="color: ${catObj.color};"><i class="fa-solid fa-circle" style="font-size: 0.5rem;"></i> ${catObj.name}</span><strong>${count} splněno</strong></div>`;
    });
    catHtml += `</div></div>`;

    catHtml += `
        <div class="stat-box-long" style="background: #172033; border: 1px solid #334155;">
            <strong style="color: #38bdf8; margin-bottom: 4px; display: block;"><i class="fa-solid fa-bolt"></i> Týdenní bilance</strong>
            <span style="font-size: 0.9rem; color: #f1f5f9;">${comparisonText}</span>
            <span style="font-size: 0.85rem; color: #10b981; margin-top: 4px; display: block;">⏱️ Celkem odpracováno/odcvičeno: <strong>${appData.totalMinutesDone} minut</strong></span>
        </div>
    `;
    advContainer.innerHTML = catHtml;

    const completedContainer = document.getElementById("completed-visions-container");
    completedContainer.innerHTML = "";
    if (!appData.completedVisions || appData.completedVisions.length === 0) {
        completedContainer.innerHTML = `<span style="font-size: 0.8rem; color: #64748b;">Žádné dokončené vize. Makáme na tom! 💪</span>`;
    } else {
        appData.completedVisions.forEach(v => {
            const cat = categories[v.cat] || { color: "#10b981" };
            completedContainer.innerHTML += `
                <div class="stat-box-long" style="border-left: 4px solid ${cat.color}; padding: 10px 14px; flex-direction: row; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="color: #f1f5f9; font-size: 0.85rem;">🏆 ${v.title}</strong>
                        <span style="color: #94a3b8; font-size: 0.7rem; display: block;">Splněno dne: ${v.completedDate}</span>
                    </div>
                    <span style="color: #10b981; font-weight: bold; font-size: 0.8rem;">✓ HOTOVO</span>
                </div>
            `;
        });
    }

    const heatmap = document.getElementById("heatmap-container");
    heatmap.innerHTML = "";
    for (let i = 27; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const cell = document.createElement("div");
        cell.className = "heatmap-cell";
        const count = appData.history[dateStr] || 0;
        if (count === 1) cell.classList.add("lvl-1");
        if (count === 2) cell.classList.add("lvl-2");
        if (count >= 3) cell.classList.add("lvl-3");
        heatmap.appendChild(cell);
    }
}

window.resetAllData = function() {
    if (confirm("Opravdu chceš smazat všechna data?")) {
        localStorage.removeItem("intrPlanDataV35");
        location.reload();
    }
};

initApp();