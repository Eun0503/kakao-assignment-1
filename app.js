// 로컬스토리지에서 기존 Todo 데이터를 불러오고, 없으면 빈 배열로 초기화
let todoList = JSON.parse(localStorage.getItem('todoList')) || [];

// 현재 선택된 날짜 State (기본값: 오늘)
let selectedDate = new Date();

// 필터 상태를 저장하는 변수 (기본값: 'all')
let currentFilter = 'all';

// DOM 요소 참조
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoListContainer = document.getElementById('todo-list');
const alertMessage = document.getElementById('alert-message');
const filterBtns = document.querySelectorAll('.filter-btn');

const monthDisplay = document.getElementById('current-month-display');
const weekDaysContainer = document.getElementById('week-days-container');
const prevWeekBtn = document.getElementById('prev-week-btn');
const nextWeekBtn = document.getElementById('next-week-btn');

// 마이그레이션: 만약 기존 데이터에 date(날짜) 속성이 없는 항목이 있다면 오늘 날짜를 기본값으로 부여
const todayStr = formatDateString(new Date());
todoList = todoList.map(todo => {
    if (!todo.date) {
        todo.date = todayStr;
    }
    return todo;
});
saveToLocalStorage();

/**
 * Date 객체를 'YYYY-MM-DD' 형식의 문자열로 변환하는 헬퍼 함수
 */
function formatDateString(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 전달받은 날짜의 주간 월요일(주간 시작일)을 계산하는 함수
 */
function getMonday(dateObj) {
    const date = new Date(dateObj);
    const day = date.getDay();
    // 일요일(0)이면 6일 전으로, 그 외요일은 월요일(1) 기준 오프셋만큼 전으로 이동
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
}

/**
 * 월요일부터 7일간의 Date 객체 배열을 구하는 함수
 */
function getWeekDays(mondayObj) {
    const days = [];
    for (let i = 0; i < 7; i++) {
        const tempDate = new Date(mondayObj);
        tempDate.setDate(mondayObj.getDate() + i);
        days.push(tempDate);
    }
    return days;
}

/**
 * 주간 캘린더 네비게이터를 화면에 그리는 함수
 */
function renderWeekNavigator() {
    const monday = getMonday(selectedDate);
    const weekDays = getWeekDays(monday);
    
    // 상단 연도/월 헤더 업데이트
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    monthDisplay.textContent = `${year}년 ${month}월`;
    
    weekDaysContainer.innerHTML = '';
    
    const daysKo = ['월', '화', '수', '목', '금', '토', '일'];
    const todayStr = formatDateString(new Date());
    const selectedStr = formatDateString(selectedDate);
    
    weekDays.forEach((day, index) => {
        const dayStr = formatDateString(day);
        const isSelected = (dayStr === selectedStr);
        const isToday = (dayStr === todayStr);
        
        // 해당 날짜에 저장된 총 할 일 개수 계산 (완료 여부 상관 없이 전체 개수)
        const todoCountForDay = todoList.filter(todo => todo.date === dayStr).length;
        
        // 날짜 카드 요소 생성
        const dayCard = document.createElement('div');
        dayCard.className = `day-card ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`;
        
        dayCard.innerHTML = `
            <span class="day-label">${daysKo[index]}</span>
            <span class="day-number">${day.getDate()}</span>
            <span class="day-count">${todoCountForDay}</span>
        `;
        
        // 클릭 시 해당 날짜 선택 처리
        dayCard.addEventListener('click', () => {
            selectedDate = day;
            renderWeekNavigator();
            renderTodos();
        });
        
        weekDaysContainer.appendChild(dayCard);
    });
}

/**
 * 현재 todoList 상태를 로컬스토리지에 저장하는 함수
 */
function saveToLocalStorage() {
    localStorage.setItem('todoList', JSON.stringify(todoList));
}

/**
 * 새로운 Todo 데이터를 배열에 추가하는 함수 (선택된 날짜 정보 포함)
 */
function addTodo(event) {
    // 폼 제출에 의한 새로고침 방지
    event.preventDefault();

    const todoText = todoInput.value.trim();

    // 1. 유효성 검사: 입력값이 비어있을 때 안내 메시지 출력
    if (todoText === '') {
        alertMessage.textContent = '할 일을 입력해주세요!';
        alertMessage.style.opacity = '1';
        return;
    }

    // 안내 메시지 초기화
    alertMessage.textContent = '';
    alertMessage.style.opacity = '0';

    // 2. 새 Todo 객체 생성 (현재 선택된 날짜 저장)
    const newTodo = {
        id: Date.now(), // 고유 ID로 사용
        text: todoText,
        completed: false,
        isEditing: false, // 수정 모드 활성화 여부
        date: formatDateString(selectedDate) // YYYY-MM-DD 형식으로 저장
    };

    // 3. State에 추가, 로컬스토리지 저장 및 렌더링
    todoList.push(newTodo);
    saveToLocalStorage();
    todoInput.value = ''; // 입력창 비우기
    renderTodos();
}

/**
 * Todo 항목의 완료 상태를 토글하는 함수
 */
function toggleComplete(id) {
    todoList = todoList.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveToLocalStorage();
    renderTodos();
}

/**
 * Todo 항목을 삭제하는 함수
 */
function deleteTodo(id) {
    todoList = todoList.filter(todo => todo.id !== id);
    saveToLocalStorage();
    renderTodos();
}

/**
 * Todo 항목의 수정 모드를 활성화하는 함수
 */
function enableEditMode(id) {
    todoList = todoList.map(todo => {
        if (todo.id === id) {
            return { ...todo, isEditing: true };
        }
        return todo;
    });
    renderTodos();
}

/**
 * 수정한 텍스트를 저장하는 함수
 */
function saveEdit(id, newText) {
    const trimmedText = newText.trim();
    
    // 수정 시에도 입력값 유효성 검사 진행
    if (trimmedText === '') {
        alert('할 일을 입력해주세요!');
        return;
    }

    todoList = todoList.map(todo => {
        if (todo.id === id) {
            return { ...todo, text: trimmedText, isEditing: false };
        }
        return todo;
    });
    saveToLocalStorage();
    renderTodos();
}

/**
 * 수정을 취소하고 원래 상태로 되돌리는 함수
 */
function cancelEdit(id) {
    todoList = todoList.map(todo => {
        if (todo.id === id) {
            return { ...todo, isEditing: false };
        }
        return todo;
    });
    renderTodos();
}

/**
 * todoList 배열을 기반으로 화면에 Todo 목록을 렌더링하는 함수
 */
function renderTodos() {
    todoListContainer.innerHTML = '';

    const targetDateStr = formatDateString(selectedDate);

    // 1. 현재 선택된 날짜에 해당하고 필터 조건에 맞는 배열 생성
    const filteredTodos = todoList.filter(todo => {
        // 날짜가 다르면 걸러냄
        if (todo.date !== targetDateStr) {
            return false;
        }
        // 필터 상태 처리
        if (currentFilter === 'active') {
            return !todo.completed;
        }
        if (currentFilter === 'completed') {
            return todo.completed;
        }
        return true; // 'all'
    });

    // 2. 빈 상태(데이터 없음)에 대한 화면 처리
    if (filteredTodos.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'empty-state';
        
        // 현재 선택된 필터에 따라 문구 설정
        if (currentFilter === 'active') {
            emptyItem.textContent = '진행 중인 할 일이 없습니다.';
        } else if (currentFilter === 'completed') {
            emptyItem.textContent = '완료된 할 일이 없습니다.';
        } else {
            emptyItem.textContent = '등록된 할 일이 없습니다.';
        }
        
        todoListContainer.appendChild(emptyItem);
        
        // 달력 숫자 갱신을 위해 네비게이터 리렌더
        renderWeekNavigator();
        return;
    }

    // 3. 필터링된 항목들 화면에 그리기
    filteredTodos.forEach(todo => {
        // 개별 Todo 아이템의 최상위 리스트 태그 생성
        const todoItem = document.createElement('li');
        todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        // 3-1. 수정 모드일 때의 HTML 구성
        if (todo.isEditing) {
            todoItem.innerHTML = `
                <div class="todo-left">
                    <input type="text" class="edit-input" value="${escapeHtml(todo.text)}" id="edit-${todo.id}">
                </div>
                <div class="btn-group">
                    <button class="save-btn" onclick="triggerSave(${todo.id})">저장</button>
                    <button onclick="cancelEdit(${todo.id})">취소</button>
                </div>
            `;
        } 
        // 3-2. 일반 보기 모드일 때의 HTML 구성
        else {
            todoItem.innerHTML = `
                <div class="todo-left">
                    <span class="todo-text">${escapeHtml(todo.text)}</span>
                </div>
                <div class="btn-group">
                    <button class="complete-btn ${todo.completed ? 'completed' : ''}" onclick="toggleComplete(${todo.id})">
                        ${todo.completed ? '해제' : '완료'}
                    </button>
                    <button onclick="enableEditMode(${todo.id})">수정</button>
                    <button class="delete-btn" onclick="deleteTodo(${todo.id})">삭제</button>
                </div>
            `;
        }

        todoListContainer.appendChild(todoItem);
    });

    // CRUD 조작 등으로 데이터 개수가 바뀌었을 수 있으므로 주간 캘린더 개수 배지 업데이트
    renderWeekNavigator();
}

/**
 * 인라인 수정 중 '저장' 버튼 동작을 돕는 유틸리티 함수
 */
window.triggerSave = function(id) {
    const editInput = document.getElementById(`edit-${id}`);
    if (editInput) {
        saveEdit(id, editInput.value);
    }
};

/**
 * XSS 공격 방지를 위한 HTML 이스케이프 유틸리티 함수
 */
function escapeHtml(unsafeText) {
    return unsafeText
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// 이벤트 리스너 등록: 입력 폼 제출
todoForm.addEventListener('submit', addTodo);

// 이벤트 리스너 등록: 필터 탭 클릭 처리
filterBtns.forEach(btn => {
    btn.addEventListener('click', (event) => {
        // 모든 필터 버튼에서 active 클래스 제거
        filterBtns.forEach(b => b.classList.remove('active'));
        
        // 클릭된 필터 버튼에 active 클래스 추가 (시각적 구분)
        event.target.classList.add('active');
        
        // 필터 상태 변경 및 다시 그리기
        currentFilter = event.target.getAttribute('data-filter');
        renderTodos();
    });
});

// 이벤트 리스너 등록: 이전 주 / 다음 주 네비게이션
prevWeekBtn.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() - 7);
    renderWeekNavigator();
    renderTodos();
});

nextWeekBtn.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() + 7);
    renderWeekNavigator();
    renderTodos();
});

// 초기화 작업
renderWeekNavigator(); // 주간 캘린더 생성 및 렌더링
renderTodos();          // 오늘 할 일 목록 렌더링
