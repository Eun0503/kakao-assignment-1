document.addEventListener('DOMContentLoaded', () => {
    // 로컬스토리지에서 기존 Todo 데이터를 불러오고, 없으면 빈 배열로 초기화 (오염 방지 예외 처리 추가)
    let todoList = [];
    try {
        todoList = JSON.parse(localStorage.getItem('todoList')) || [];
    } catch (error) {
        console.error('로컬스토리지 데이터를 파싱하는 중 오류가 발생했습니다. 빈 목록으로 초기화합니다.', error);
        todoList = [];
    }

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
    let isMigrated = false;
    todoList = todoList.map(todo => {
        if (!todo.date) {
            todo.date = todayStr;
            isMigrated = true;
        }
        return todo;
    });
    if (isMigrated) {
        saveToLocalStorage();
    }

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
     * 월요일부터 7일간의 Date 객체 배열을 구하는 함수 (현대적인 Array API 사용)
     */
    function getWeekDays(mondayObj) {
        return Array.from({ length: 7 }, (_, i) => {
            const tempDate = new Date(mondayObj);
            tempDate.setDate(mondayObj.getDate() + i);
            return tempDate;
        });
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
        const selectedStr = formatDateString(selectedDate);

        weekDays.forEach((day, index) => {
            const dayStr = formatDateString(day);
            const isSelected = (dayStr === selectedStr);
            const isToday = (dayStr === todayStr); // 클로저의 todayStr 재사용

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

            // 클릭 시 해당 날짜 선택 처리 (renderTodos 호출 시 하단에서 주간 네비게이터를 자동으로 함께 리렌더링함)
            dayCard.addEventListener('click', () => {
                selectedDate = day;
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
     * 안내/경고 메시지 영역에 메시지를 표시하는 함수
     */
    function showValidationAlert(message) {
        alertMessage.textContent = message;
        alertMessage.style.opacity = '1';
    }

    /**
     * 안내/경고 메시지를 초기화하는 함수
     */
    function clearValidationAlert() {
        alertMessage.textContent = '';
        alertMessage.style.opacity = '0';
    }

    /**
     * 특정 ID의 할 일 항목 정보를 업데이트하는 헬퍼 함수 (중복 맵 로직 단일화)
     */
    function updateTodo(id, updatedFields) {
        todoList = todoList.map(todo =>
            todo.id === id ? { ...todo, ...updatedFields } : todo
        );
    }

    /**
     * 데이터를 로컬스토리지에 저장하고 UI를 동기화하는 공통 함수
     */
    function saveAndRender() {
        saveToLocalStorage();
        renderTodos();
    }

    /**
     * 주간 네비게이션을 이동하는 헬퍼 함수 (불변성 유지 및 중복 코드 단일화)
     */
    function shiftWeek(offsetDays) {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + offsetDays);
        selectedDate = newDate;
        renderTodos();
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
            showValidationAlert('할 일을 입력해주세요!');
            return;
        }

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
        todoInput.value = ''; // 입력창 비우기
        saveAndRender();
    }

    /**
     * Todo 항목의 완료 상태를 토글하는 함수
     */
    function toggleComplete(id) {
        const todo = todoList.find(t => t.id === id);
        if (todo) {
            updateTodo(id, { completed: !todo.completed });
            saveAndRender();
        }
    }

    /**
     * Todo 항목을 삭제하는 함수
     */
    function deleteTodo(id) {
        todoList = todoList.filter(todo => todo.id !== id);
        saveAndRender();
    }

    /**
     * Todo 항목의 수정 모드를 활성화하는 함수
     */
    function enableEditMode(id) {
        updateTodo(id, { isEditing: true });
        renderTodos();
    }

    /**
     * 수정한 텍스트를 저장하는 함수
     */
    function saveEdit(id, newText) {
        const trimmedText = newText.trim();

        // 수정 시에도 입력값 유효성 검사 진행
        if (trimmedText === '') {
            showValidationAlert('할 일을 입력해주세요!');
            return;
        }

        updateTodo(id, { text: trimmedText, isEditing: false });
        saveAndRender();
    }

    /**
     * 수정을 취소하고 원래 상태로 되돌리는 함수
     */
    function cancelEdit(id) {
        updateTodo(id, { isEditing: false });
        renderTodos();
    }

    /**
     * todoList 배열을 기반으로 화면에 Todo 목록을 렌더링하는 함수
     */
    function renderTodos() {
        // 성공적인 화면 갱신 흐름 진입 시 경고 상태 자동 초기화
        clearValidationAlert();

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

        // 최적화를 위한 DocumentFragment 생성
        const fragment = document.createDocumentFragment();

        // 3. 필터링된 항목들 화면에 그리기
        filteredTodos.forEach(todo => {
            // 개별 Todo 아이템의 최상위 리스트 태그 생성
            const todoItem = document.createElement('li');
            todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;

            // 3-1. 수정 모드일 때의 HTML 구성
            if (todo.isEditing) {
                todoItem.innerHTML = `
                    <div class="todo-left">
                        <input type="text" class="edit-input" value="${escapeHtml(todo.text)}">
                    </div>
                    <div class="btn-group">
                        <button class="save-btn">저장</button>
                        <button class="cancel-btn">취소</button>
                    </div>
                `;

                const editInput = todoItem.querySelector('.edit-input');
                const saveBtn = todoItem.querySelector('.save-btn');
                const cancelBtn = todoItem.querySelector('.cancel-btn');

                // 저장 버튼 클릭
                saveBtn.addEventListener('click', () => {
                    saveEdit(todo.id, editInput.value);
                });

                // 입력창 내 엔터/ESC 키 바인딩
                editInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        saveEdit(todo.id, editInput.value);
                    } else if (e.key === 'Escape') {
                        cancelEdit(todo.id);
                    }
                });

                // 입력 중에는 경고 메시지 해제
                editInput.addEventListener('input', clearValidationAlert);

                // 취소 버튼 클릭
                cancelBtn.addEventListener('click', () => {
                    cancelEdit(todo.id);
                });
            }
            // 3-2. 일반 보기 모드일 때의 HTML 구성
            else {
                todoItem.innerHTML = `
                    <div class="todo-left">
                        <span class="todo-text">${escapeHtml(todo.text)}</span>
                    </div>
                    <div class="btn-group">
                        <button class="complete-btn ${todo.completed ? 'completed' : ''}">
                            ${todo.completed ? '해제' : '완료'}
                        </button>
                        <button class="edit-btn">수정</button>
                        <button class="delete-btn">삭제</button>
                    </div>
                `;

                const completeBtn = todoItem.querySelector('.complete-btn');
                const editBtn = todoItem.querySelector('.edit-btn');
                const deleteBtn = todoItem.querySelector('.delete-btn');

                // 완료 토글
                completeBtn.addEventListener('click', () => {
                    toggleComplete(todo.id);
                });

                // 수정 모드 전환
                editBtn.addEventListener('click', () => {
                    enableEditMode(todo.id);
                });

                // 삭제
                deleteBtn.addEventListener('click', () => {
                    deleteTodo(todo.id);
                });
            }

            fragment.appendChild(todoItem);
        });

        todoListContainer.appendChild(fragment);

        // 수정 모드 활성화된 입력 필드가 있다면 자동 포커싱 처리 및 커서를 마지막으로 이동
        const activeEditInput = todoListContainer.querySelector('.edit-input');
        if (activeEditInput) {
            activeEditInput.focus();
            const valueLength = activeEditInput.value.length;
            activeEditInput.setSelectionRange(valueLength, valueLength);
        }

        // CRUD 조작 등으로 데이터 개수가 바뀌었을 수 있으므로 주간 캘린더 개수 배지 업데이트
        renderWeekNavigator();
    }

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

    // 입력 필드 입력 시 경고 메시지 자동 초기화
    todoInput.addEventListener('input', clearValidationAlert);

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
    prevWeekBtn.addEventListener('click', () => shiftWeek(-7));
    nextWeekBtn.addEventListener('click', () => shiftWeek(7));

    // 초기화 작업 (renderTodos 내부에서 renderWeekNavigator를 연이어 실행하므로 renderTodos 단독으로 충분함)
    renderTodos();
});
