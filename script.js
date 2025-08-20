// script.js

// 전역 변수
let studentsData = {};
const STUDENT_NUMBERS = [1,2,3,4,5,6,7,8,9,10,11,12,13,51,52,53,54,55,56,57,58];

// Google Apps Script URL (실제 URL로 교체 필요)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyvwQYw5MoTNynOUUOJAdNXiGaCPF8zLHECfOFiUGVBh1AjMN_GFtId06D2Gu1f-f53/exec';

// 페이지 로드시 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    setupEventListeners();
    setupStarRatings();
});

// 로컬 스토리지에서 데이터 로드
function loadFromLocalStorage() {
    const saved = localStorage.getItem('studentsData');
    if (saved) {
        studentsData = JSON.parse(saved);
    }
}

// 로컬 스토리지에 데이터 저장
function saveToLocalStorage() {
    localStorage.setItem('studentsData', JSON.stringify(studentsData));
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 학생 번호 선택시
    document.getElementById('studentNumber').addEventListener('change', (e) => {
        if (e.target.value) {
            loadStudentData(e.target.value);
        }
    });

    // 체크박스 변경시 날짜 자동 입력
    const checkboxes = ['plan1', 'plan2', 'writing', 'reading'];
    checkboxes.forEach(id => {
        document.getElementById(id).addEventListener('change', (e) => {
            if (e.target.checked && !document.getElementById(id + 'Date').value) {
                document.getElementById(id + 'Date').value = new Date().toISOString().split('T')[0];
            }
        });
    });

    // 선택과제 변경시 날짜 자동 입력
    document.getElementById('optional1').addEventListener('change', (e) => {
        if (e.target.value && !document.getElementById('optional1Date').value) {
            document.getElementById('optional1Date').value = new Date().toISOString().split('T')[0];
        }
    });

    document.getElementById('optional2').addEventListener('change', (e) => {
        if (e.target.value && !document.getElementById('optional2Date').value) {
            document.getElementById('optional2Date').value = new Date().toISOString().split('T')[0];
        }
    });
}

// 별점 시스템 설정
function setupStarRatings() {
    document.querySelectorAll('.rating').forEach(rating => {
        const stars = rating.querySelectorAll('.star');
        const taskName = rating.dataset.task;
        
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                const value = index + 1;
                updateStarDisplay(rating, value);
                // 데이터 저장을 위해 rating 값을 임시 저장
                rating.dataset.value = value;
            });
            
            star.addEventListener('mouseenter', () => {
                highlightStars(rating, index + 1);
            });
        });
        
        rating.addEventListener('mouseleave', () => {
            const currentValue = parseInt(rating.dataset.value) || 0;
            updateStarDisplay(rating, currentValue);
        });
    });
}

// 별점 표시 업데이트
function updateStarDisplay(rating, value) {
    const stars = rating.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < value) {
            star.textContent = '★';
            star.classList.add('filled');
        } else {
            star.textContent = '☆';
            star.classList.remove('filled');
        }
    });
}

// 별점 하이라이트
function highlightStars(rating, value) {
    const stars = rating.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < value) {
            star.textContent = '★';
        } else {
            star.textContent = '☆';
        }
    });
}

// 탭 전환
function switchTab(tabName) {
    // 모든 탭과 컨텐츠 숨기기
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // 선택한 탭 활성화
    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // 각 탭별 데이터 로드
    switch(tabName) {
        case 'status':
            loadAllStudents();
            break;
        case 'stats':
            loadStatistics();
            break;
        case 'portfolio':
            loadPortfolio();
            break;
    }
}

// 학생 데이터 불러오기
function loadStudentData(studentNumber) {
    const data = studentsData[studentNumber];
    if (!data) {
        resetForm();
        return;
    }
    
    // 체크박스
    document.getElementById('plan1').checked = data.plan1 || false;
    document.getElementById('plan2').checked = data.plan2 || false;
    document.getElementById('writing').checked = data.writing || false;
    document.getElementById('reading').checked = data.reading || false;
    
    // 날짜
    document.getElementById('plan1Date').value = data.plan1Date || '';
    document.getElementById('plan2Date').value = data.plan2Date || '';
    document.getElementById('writingDate').value = data.writingDate || '';
    document.getElementById('readingDate').value = data.readingDate || '';
    document.getElementById('optional1Date').value = data.optional1Date || '';
    document.getElementById('optional2Date').value = data.optional2Date || '';
    
    // 선택 항목
    document.getElementById('writingTopic').value = data.writingTopic || '';
    document.getElementById('optional1').value = data.optional1Choice || '';
    document.getElementById('optional2').value = data.optional2Choice || '';
    
    // 평가 (별점)
    if (data.plan1Rating) updateStarDisplay(document.querySelector('[data-task="plan1"]'), data.plan1Rating);
    if (data.plan2Rating) updateStarDisplay(document.querySelector('[data-task="plan2"]'), data.plan2Rating);
    if (data.writingRating) updateStarDisplay(document.querySelector('[data-task="writing"]'), data.writingRating);
    if (data.readingRating) updateStarDisplay(document.querySelector('[data-task="reading"]'), data.readingRating);
    if (data.optional1Rating) updateStarDisplay(document.querySelector('[data-task="optional1"]'), data.optional1Rating);
    if (data.optional2Rating) updateStarDisplay(document.querySelector('[data-task="optional2"]'), data.optional2Rating);
    
    // 비고
    document.getElementById('notes').value = data.notes || '';
}

// 학생 데이터 저장
function saveStudent() {
    const studentNumber = document.getElementById('studentNumber').value;
    
    if (!studentNumber) {
        showMessage('학생 번호를 선택해주세요.', 'error');
        return;
    }
    
    const data = {
        studentNumber: studentNumber,
        plan1: document.getElementById('plan1').checked,
        plan2: document.getElementById('plan2').checked,
        writing: document.getElementById('writing').checked,
        reading: document.getElementById('reading').checked,
        plan1Date: document.getElementById('plan1Date').value,
        plan2Date: document.getElementById('plan2Date').value,
        writingDate: document.getElementById('writingDate').value,
        readingDate: document.getElementById('readingDate').value,
        writingTopic: document.getElementById('writingTopic').value,
        optional1Choice: document.getElementById('optional1').value,
        optional2Choice: document.getElementById('optional2').value,
        optional1Date: document.getElementById('optional1Date').value,
        optional2Date: document.getElementById('optional2Date').value,
        plan1Rating: parseInt(document.querySelector('[data-task="plan1"]').dataset.value) || 0,
        plan2Rating: parseInt(document.querySelector('[data-task="plan2"]').dataset.value) || 0,
        writingRating: parseInt(document.querySelector('[data-task="writing"]').dataset.value) || 0,
        readingRating: parseInt(document.querySelector('[data-task="reading"]').dataset.value) || 0,
        optional1Rating: parseInt(document.querySelector('[data-task="optional1"]').dataset.value) || 0,
        optional2Rating: parseInt(document.querySelector('[data-task="optional2"]').dataset.value) || 0,
        notes: document.getElementById('notes').value,
        lastUpdated: new Date().toLocaleString('ko-KR')
    };
    
    studentsData[studentNumber] = data;
    saveToLocalStorage();
    showMessage(`${studentNumber}번 학생 데이터가 저장되었습니다.`, 'success');
    
    // 다음 학생 번호로 자동 이동 (선택사항)
    moveToNextStudent(studentNumber);
}

// 다음 학생 번호로 이동
function moveToNextStudent(currentNumber) {
    const currentIndex = STUDENT_NUMBERS.indexOf(parseInt(currentNumber));
    if (currentIndex < STUDENT_NUMBERS.length - 1) {
        const nextNumber = STUDENT_NUMBERS[currentIndex + 1];
        document.getElementById('studentNumber').value = nextNumber;
        loadStudentData(nextNumber);
    }
}

// 폼 초기화
function resetForm() {
    document.getElementById('plan1').checked = false;
    document.getElementById('plan2').checked = false;
    document.getElementById('writing').checked = false;
    document.getElementById('reading').checked = false;
    
    document.getElementById('plan1Date').value = '';
    document.getElementById('plan2Date').value = '';
    document.getElementById('writingDate').value = '';
    document.getElementById('readingDate').value = '';
    document.getElementById('optional1Date').value = '';
    document.getElementById('optional2Date').value = '';
    
    document.getElementById('writingTopic').value = '';
    document.getElementById('optional1').value = '';
    document.getElementById('optional2').value = '';
    
    document.getElementById('notes').value = '';
    
    // 별점 초기화
    document.querySelectorAll('.rating').forEach(rating => {
        updateStarDisplay(rating, 0);
        rating.dataset.value = 0;
    });
}

// 전체 학생 현황 로드
function loadAllStudents() {
    const tbody = document.getElementById('statusTableBody');
    tbody.innerHTML = '';
    
    STUDENT_NUMBERS.forEach(num => {
        const student = studentsData[num] || {};
        const row = createStatusRow(num, student);
        tbody.appendChild(row);
    });
}

// 현황 테이블 행 생성
function createStatusRow(number, data) {
    const row = document.createElement('tr');
    
    // 완료율 계산
    let completed = 0;
    let total = 5;
    
    if (data.plan1 && data.plan2) completed++;
    else if (data.plan1 || data.plan2) completed += 0.5;
    
    if (data.writing) completed++;
    if (data.reading) completed++;
    if (data.optional1Choice) completed++;
    if (data.optional2Choice) completed++;
    
    const percentage = Math.round((completed / total) * 100);
    const progressClass = percentage >= 80 ? 'progress-high' : 
                          percentage >= 50 ? 'progress-medium' : 'progress-low';
    
    // 계획표 상태
    let planStatus = '';
    if (data.plan1 && data.plan2) {
        planStatus = '✅';
        if (data.plan1Rating >= 4 || data.plan2Rating >= 4) {
            planStatus += `⭐${Math.max(data.plan1Rating, data.plan2Rating)}`;
        }
    } else if (data.plan1 || data.plan2) {
        planStatus = '◐';
    } else {
        planStatus = '❌';
    }
    
    row.innerHTML = `
        <td><strong>${number}</strong></td>
        <td>${planStatus}</td>
        <td>${data.writing ? '✅' : '❌'}${data.writingRating >= 4 ? `⭐${data.writingRating}` : ''}</td>
        <td>${data.reading ? '✅' : '❌'}${data.readingRating >= 4 ? `⭐${data.readingRating}` : ''}</td>
        <td>${data.optional1Choice ? data.optional1Choice.substring(0, 10) : '-'}${data.optional1Rating >= 4 ? `⭐${data.optional1Rating}` : ''}</td>
        <td>${data.optional2Choice ? data.optional2Choice.substring(0, 10) : '-'}${data.optional2Rating >= 4 ? `⭐${data.optional2Rating}` : ''}</td>
        <td class="${progressClass}">${percentage}%</td>
        <td>${data.notes ? data.notes.substring(0, 20) : ''}</td>
    `;
    
    return row;
}

// 통계 로드
function loadStatistics() {
    const container = document.querySelector('.stats-container');
    
    // 통계 계산
    const stats = calculateStatistics();
    
    container.innerHTML = `
        <div class="stats-summary">
            <div class="stat-card">
                <div class="stat-number">21명</div>
                <div class="stat-label">전체 학생</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.avgCompletion}%</div>
                <div class="stat-label">평균 완료율</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.allComplete}명</div>
                <div class="stat-label">전체 완료</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.mandatoryComplete}명</div>
                <div class="stat-label">필수 완료</div>
            </div>
        </div>
        
        <div class="progress-section">
            <h3>📈 과제별 이행률</h3>
            ${createProgressBars(stats)}
        </div>
        
        <div class="optional-stats">
            <h3>🌟 선택과제 현황</h3>
            ${createOptionalStats(stats)}
        </div>
    `;
}

// 통계 계산
function calculateStatistics() {
    let stats = {
        plan1: 0,
        plan2: 0,
        writing: 0,
        reading: 0,
        optional1: 0,
        optional2: 0,
        allComplete: 0,
        mandatoryComplete: 0,
        totalCompletion: 0,
        optional1Choices: {},
        optional2Choices: {}
    };
    
    STUDENT_NUMBERS.forEach(num => {
        const data = studentsData[num];
        if (!data) return;
        
        if (data.plan1) stats.plan1++;
        if (data.plan2) stats.plan2++;
        if (data.writing) stats.writing++;
        if (data.reading) stats.reading++;
        
        // 필수과제 완료 체크
        if (data.plan1 && data.plan2 && data.writing && data.reading) {
            stats.mandatoryComplete++;
        }
        
        // 선택과제
        if (data.optional1Choice) {
            stats.optional1++;
            stats.optional1Choices[data.optional1Choice] = 
                (stats.optional1Choices[data.optional1Choice] || 0) + 1;
        }
        if (data.optional2Choice) {
            stats.optional2++;
            stats.optional2Choices[data.optional2Choice] = 
                (stats.optional2Choices[data.optional2Choice] || 0) + 1;
        }
        
        // 전체 완료
        if (data.plan1 && data.plan2 && data.writing && data.reading && 
            data.optional1Choice && data.optional2Choice) {
            stats.allComplete++;
        }
        
        // 완료율 계산
        let completed = 0;
        if (data.plan1 && data.plan2) completed++;
        if (data.writing) completed++;
        if (data.reading) completed++;
        if (data.optional1Choice) completed++;
        if (data.optional2Choice) completed++;
        stats.totalCompletion += (completed / 5) * 100;
    });
    
    stats.avgCompletion = Math.round(stats.totalCompletion / 21);
    
    return stats;
}

// 진행률 바 HTML 생성
function createProgressBars(stats) {
    let html = '';
    
    // 계획표 전체
    const planTotal = Math.max(stats.plan1, stats.plan2);
    const planPercent = Math.round((planTotal / 21) * 100);
    html += `
        <div class="progress-item">
            <div class="progress-label">
                <span>계획표 (전체)</span>
                <span>${planPercent}% (${planTotal}/21명)</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${planPercent}%">
                    ${planPercent}%
                </div>
            </div>
            <div style="margin-left: 20px; margin-top: 5px; font-size: 0.9em; color: #718096;">
                - 1차: ${stats.plan1}명 (${Math.round((stats.plan1/21)*100)}%)<br>
                - 2차: ${stats.plan2}명 (${Math.round((stats.plan2/21)*100)}%)
            </div>
        </div>
    `;
    
    // 글쓰기
    const writingPercent = Math.round((stats.writing / 21) * 100);
    html += `
        <div class="progress-item">
            <div class="progress-label">
                <span>글쓰기</span>
                <span>${writingPercent}% (${stats.writing}/21명)</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${writingPercent}%">
                    ${writingPercent}%
                </div>
            </div>
        </div>
    `;
    
    // 독서
    const readingPercent = Math.round((stats.reading / 21) * 100);
    html += `
        <div class="progress-item">
            <div class="progress-label">
                <span>한국사 독서</span>
                <span>${readingPercent}% (${stats.reading}/21명)</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${readingPercent}%">
                    ${readingPercent}%
                </div>
            </div>
        </div>
    `;
    
    // 선택과제1
    const optional1Percent = Math.round((stats.optional1 / 21) * 100);
    html += `
        <div class="progress-item">
            <div class="progress-label">
                <span>선택과제 1</span>
                <span>${optional1Percent}% (${stats.optional1}/21명)</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${optional1Percent}%">
                    ${optional1Percent}%
                </div>
            </div>
        </div>
    `;
    
    // 선택과제2
    const optional2Percent = Math.round((stats.optional2 / 21) * 100);
    html += `
        <div class="progress-item">
            <div class="progress-label">
                <span>선택과제 2</span>
                <span>${optional2Percent}% (${stats.optional2}/21명)</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${optional2Percent}%">
                    ${optional2Percent}%
                </div>
            </div>
        </div>
    `;
    
    return html;
}

// 선택과제 통계 HTML 생성
function createOptionalStats(stats) {
    let html = '';
    
    // 선택과제 1
    html += '<div class="optional-section">';
    html += `<h4>선택과제 1 - 총 ${stats.optional1}명 선택</h4>`;
    html += '<div class="optional-list">';
    
    if (Object.keys(stats.optional1Choices).length > 0) {
        Object.entries(stats.optional1Choices)
            .sort((a, b) => b[1] - a[1])
            .forEach(([choice, count]) => {
                html += `
                    <div class="optional-item">
                        <span>• ${choice}</span>
                        <span>${count}명</span>
                    </div>
                `;
            });
    } else {
        html += '<div class="optional-item">아직 선택한 학생이 없습니다.</div>';
    }
    html += '</div></div>';
    
    // 선택과제 2
    html += '<div class="optional-section" style="margin-top: 20px;">';
    html += `<h4>선택과제 2 - 총 ${stats.optional2}명 선택</h4>`;
    html += '<div class="optional-list">';
    
    if (Object.keys(stats.optional2Choices).length > 0) {
        Object.entries(stats.optional2Choices)
            .sort((a, b) => b[1] - a[1])
            .forEach(([choice, count]) => {
                html += `
                    <div class="optional-item">
                        <span>• ${choice}</span>
                        <span>${count}명</span>
                    </div>
                `;
            });
    } else {
        html += '<div class="optional-item">아직 선택한 학생이 없습니다.</div>';
    }
    html += '</div></div>';
    
    return html;
}

// 포트폴리오 로드
function loadPortfolio() {
    const container = document.querySelector('.portfolio-container');
    
    // 필터 버튼
    container.innerHTML = `
        <div class="portfolio-filter">
            <button class="filter-btn active" onclick="filterPortfolio('all')">전체</button>
            <button class="filter-btn" onclick="filterPortfolio('plan')">계획표</button>
            <button class="filter-btn" onclick="filterPortfolio('writing')">글쓰기</button>
            <button class="filter-btn" onclick="filterPortfolio('reading')">독서</button>
            <button class="filter-btn" onclick="filterPortfolio('optional')">선택과제</button>
        </div>
        <div class="portfolio-grid" id="portfolioGrid">
            <!-- 포트폴리오 카드들이 여기 들어갑니다 -->
        </div>
    `;
    
    displayPortfolio('all');
}

// 포트폴리오 표시
function displayPortfolio(filter) {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // 우수 과제 수집 (4-5점)
    const excellentTasks = {
        plan1: [],
        plan2: [],
        writing: [],
        reading: [],
        optional1: [],
        optional2: []
    };
    
    STUDENT_NUMBERS.forEach(num => {
        const data = studentsData[num];
        if (!data) return;
        
        if (data.plan1Rating >= 4) {
            excellentTasks.plan1.push({
                studentNumber: num,
                rating: data.plan1Rating,
                date: data.plan1Date,
                notes: data.notes
            });
        }
        
        if (data.plan2Rating >= 4) {
            excellentTasks.plan2.push({
                studentNumber: num,
                rating: data.plan2Rating,
                date: data.plan2Date,
                notes: data.notes
            });
        }
        
        if (data.writingRating >= 4) {
            excellentTasks.writing.push({
                studentNumber: num,
                rating: data.writingRating,
                topic: data.writingTopic,
                date: data.writingDate,
                notes: data.notes
            });
        }
        
        if (data.readingRating >= 4) {
            excellentTasks.reading.push({
                studentNumber: num,
                rating: data.readingRating,
                date: data.readingDate,
                notes: data.notes
            });
        }
        
        if (data.optional1Rating >= 4) {
            excellentTasks.optional1.push({
                studentNumber: num,
                rating: data.optional1Rating,
                choice: data.optional1Choice,
                date: data.optional1Date,
                notes: data.notes
            });
        }
        
        if (data.optional2Rating >= 4) {
            excellentTasks.optional2.push({
                studentNumber: num,
                rating: data.optional2Rating,
                choice: data.optional2Choice,
                date: data.optional2Date,
                notes: data.notes
            });
        }
    });
    
    // 카드 생성
    if (filter === 'all' || filter === 'plan') {
        if (excellentTasks.plan1.length > 0 || excellentTasks.plan2.length > 0) {
            const card = createPortfolioCard('📅 방학 계획표', 
                [...excellentTasks.plan1, ...excellentTasks.plan2], 'plan');
            grid.innerHTML += card;
        }
    }
    
    if (filter === 'all' || filter === 'writing') {
        if (excellentTasks.writing.length > 0) {
            const card = createPortfolioCard('✍️ 주제 글쓰기', 
                excellentTasks.writing, 'writing');
            grid.innerHTML += card;
        }
    }
    
    if (filter === 'all' || filter === 'reading') {
        if (excellentTasks.reading.length > 0) {
            const card = createPortfolioCard('📚 한국사 독서', 
                excellentTasks.reading, 'reading');
            grid.innerHTML += card;
        }
    }
    
    if (filter === 'all' || filter === 'optional') {
        if (excellentTasks.optional1.length > 0) {
            const card = createPortfolioCard('🌻 선택과제 1', 
                excellentTasks.optional1, 'optional1');
            grid.innerHTML += card;
        }
        
        if (excellentTasks.optional2.length > 0) {
            const card = createPortfolioCard('🌳 선택과제 2', 
                excellentTasks.optional2, 'optional2');
            grid.innerHTML += card;
        }
    }
    
    if (grid.innerHTML === '') {
        grid.innerHTML = '<div style="text-align: center; padding: 40px; color: #718096;">아직 우수 과제(4-5점)가 없습니다.</div>';
    }
}

// 포트폴리오 카드 생성
function createPortfolioCard(title, tasks, type) {
    let itemsHtml = '';
    
    tasks.sort((a, b) => b.rating - a.rating);
    
    tasks.forEach(task => {
        let detail = '';
        if (type === 'writing' && task.topic) {
            detail = ` - "${task.topic}"`;
        } else if (type === 'optional1' && task.choice) {
            detail = ` - ${task.choice}`;
        } else if (type === 'optional2' && task.choice) {
            detail = ` - ${task.choice}`;
        }
        
        itemsHtml += `
            <div class="portfolio-student">
                <strong>${task.studentNumber}번 학생</strong> 
                <span class="portfolio-rating">${'★'.repeat(task.rating)}</span>
                ${detail}
                ${task.notes ? `<div class="portfolio-note">📝 ${task.notes}</div>` : ''}
            </div>
        `;
    });
    
    return `
        <div class="portfolio-card">
            <div class="portfolio-header">
                <div class="portfolio-title">${title}</div>
                <div class="portfolio-count">${tasks.length}개</div>
            </div>
            <div class="portfolio-items">
                ${itemsHtml}
            </div>
        </div>
    `;
}

// 포트폴리오 필터
function filterPortfolio(filter) {
    // 버튼 활성화 상태 변경
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayPortfolio(filter);
}

// 구글 시트로 내보내기
function exportToSheets() {
    if (!SCRIPT_URL || SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
        // 로컬 CSV 다운로드
        downloadAsCSV();
        return;
    }
    
    showMessage('구글 시트로 내보내는 중...', 'success');
    
    // 모든 학생 데이터 준비
    const studentsArray = Object.values(studentsData);
    
    fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'saveAllStudents',
            students: studentsArray
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage('구글 시트로 내보내기 완료!', 'success');
        } else {
            showMessage('내보내기 실패: ' + data.error, 'error');
        }
    })
    .catch(error => {
        showMessage('오류 발생: ' + error, 'error');
    });
}

// CSV 다운로드
function downloadAsCSV() {
    let csv = '\uFEFF학생번호,계획표1차,계획표2차,글쓰기,글쓰기주제,독서,선택1,선택2,완료율,비고\n';
    
    STUDENT_NUMBERS.forEach(num => {
        const data = studentsData[num] || {};
        
        // 완료율 계산
        let completed = 0;
        if (data.plan1 && data.plan2) completed++;
        if (data.writing) completed++;
        if (data.reading) completed++;
        if (data.optional1Choice) completed++;
        if (data.optional2Choice) completed++;
        const percentage = Math.round((completed / 5) * 100);
        
        csv += `${num},`;
        csv += `${data.plan1 ? 'O' : 'X'},`;
        csv += `${data.plan2 ? 'O' : 'X'},`;
        csv += `${data.writing ? 'O' : 'X'},`;
        csv += `"${data.writingTopic || ''}",`;
        csv += `${data.reading ? 'O' : 'X'},`;
        csv += `"${data.optional1Choice || ''}",`;
        csv += `"${data.optional2Choice || ''}",`;
        csv += `${percentage}%,`;
        csv += `"${data.notes || ''}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `과제현황_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showMessage('CSV 파일이 다운로드되었습니다.', 'success');
}

// 메시지 표시
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}