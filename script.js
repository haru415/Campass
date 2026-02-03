let subjects = JSON.parse(localStorage.getItem('campus-subjects-v2')) || [];
let currentDay = '月';

const timetable = document.getElementById('timetable');
const nameInput = document.getElementById('subject-name');
const roomInput = document.getElementById('room-name');

window.changeDay = (day) => {
    currentDay = day;
    document.getElementById('current-day-display').innerText = `${day}曜日の講義`;
    document.querySelectorAll('.day-tabs button').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === day);
    });
    render();
};

function render() {
    timetable.innerHTML = '';
    const filtered = subjects.filter(s => s.day === currentDay);

    filtered.forEach((sub) => {
        const maxAbsent = 3;
        const remaining = maxAbsent - sub.absent;
        
        let statusClass = 'border-safe';
        let alertMsg = `あと ${remaining} 回休めます`;
        
        if (remaining === 1) {
            statusClass = 'border-warning';
            alertMsg = `【注意】あと 1 回しか休めません`;
        } else if (remaining <= 0) {
            statusClass = 'border-danger';
            alertMsg = `【危険】単位取得が不可能です`;
        }

        const card = document.createElement('div');
        card.className = `card ${statusClass}`;
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <h3 style="margin:0;">${sub.name}</h3>
                <span style="font-size:12px; color:#666;">${sub.room}</span>
            </div>
            
            <div class="attendance-counts">
                <span style="color:var(--safe)">出席: ${sub.present || 0}</span>
                <span style="color:var(--danger)">欠席: ${sub.absent}</span>
            </div>
            
            <div class="alert-text">${alertMsg}</div>
            
            <div class="btn-group">
                <button class="present-btn" onclick="updateAttendance('${sub.id}', 'present')">出席</button>
                <button class="absent-btn" onclick="updateAttendance('${sub.id}', 'absent')">欠席</button>
            </div>

            <div class="memo-area">
                <span contenteditable="true" onblur="updateMemo('${sub.id}', this.innerText)">${sub.memo || ''}</span>
            </div>
            <button class="delete-btn" onclick="deleteSubject('${sub.id}')">講義を削除</button>
        `;
        timetable.appendChild(card);
    });
    
    localStorage.setItem('campus-subjects-v2', JSON.stringify(subjects));
}

document.getElementById('add-btn').onclick = () => {
    const name = nameInput.value.trim();
    if (!name) return;
    
    subjects.push({
        id: Date.now().toString(),
        name: name,
        room: roomInput.value || '教室未設定',
        day: currentDay,
        present: 0,
        absent: 0,
        memo: ''
    });
    
    nameInput.value = '';
    roomInput.value = '';
    render();
};

window.updateAttendance = (id, type) => {
    const sub = subjects.find(s => s.id === id);
    if (type === 'present') sub.present = (sub.present || 0) + 1;
    else if (type === 'absent') sub.absent++;
    render();
};

window.updateMemo = (id, text) => {
    const sub = subjects.find(s => s.id === id);
    if (sub) {
        sub.memo = text;
        localStorage.setItem('campus-subjects-v2', JSON.stringify(subjects));
    }
};

window.deleteSubject = (id) => {
    if (confirm('講義を削除しますか？')) {
        subjects = subjects.filter(s => s.id !== id);
        render();
    }
};

// 起動時に月曜日を表示
changeDay('月');
