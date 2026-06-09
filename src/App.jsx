import { useState, useEffect } from 'react';
import TodoHeader from './components/TodoHeader';
import WeeklyNavigator from './components/WeeklyNavigator';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import { formatDateString, getMonday } from './utils/date';

function App() {
  // 1. 투두 리스트 상태 (lazy initialization & migration)
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem('todoList');
      const parsed = saved ? JSON.parse(saved) : [];
      
      // 마이그레이션: date 속성이 없는 항목은 오늘 날짜로 지정
      const todayStr = formatDateString(new Date());
      let isMigrated = false;
      const migratedTodos = parsed.map(todo => {
        if (!todo.date) {
          todo.date = todayStr;
          isMigrated = true;
        }
        return todo;
      });
      
      if (isMigrated) {
        localStorage.setItem('todoList', JSON.stringify(migratedTodos));
      }
      return migratedTodos;
    } catch (error) {
      console.error('로컬스토리지 데이터를 파싱하는 중 오류가 발생했습니다. 빈 목록으로 초기화합니다.', error);
      return [];
    }
  });

  // 2. 선택된 날짜 상태 (기본값: 오늘)
  const [selectedDate, setSelectedDate] = useState(() => {
    const saved = localStorage.getItem('selectedDate');
    return saved ? new Date(saved) : new Date();
  });

  // 3. 주간 시작일 상태 (기본값: 선택된 날짜의 월요일)
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const saved = localStorage.getItem('weekStartDate');
    return saved ? new Date(saved) : getMonday(new Date());
  });

  // 4. 필터 상태 (기본값: 'all')
  const [currentFilter, setCurrentFilter] = useState('all');

  // -------------------------------------------------------------
  // 로컬스토리지 동기화 Effect
  // -------------------------------------------------------------
  useEffect(() => {
    localStorage.setItem('todoList', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('selectedDate', selectedDate.toISOString());
  }, [selectedDate]);

  useEffect(() => {
    localStorage.setItem('weekStartDate', weekStartDate.toISOString());
  }, [weekStartDate]);

  // -------------------------------------------------------------
  // 투두 조작 핸들러
  // -------------------------------------------------------------
  const handleAddTodo = (text) => {
    const newTodo = {
      id: Date.now(),
      text,
      completed: false,
      isEditing: false,
      date: formatDateString(selectedDate)
    };
    setTodos((prev) => [...prev, newTodo]);
  };

  /**
   * 특정 ID의 할 일 항목을 업데이트하는 공통 State 갱신 함수 (map 중복 제거)
   */
  const updateTodoState = (id, updater) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, ...(typeof updater === 'function' ? updater(todo) : updater) }
          : todo
      )
    );
  };

  const handleToggleComplete = (id) => {
    updateTodoState(id, (todo) => ({ completed: !todo.completed }));
  };

  const handleDeleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const handleEnableEditMode = (id) => {
    updateTodoState(id, { isEditing: true });
  };

  const handleSaveEdit = (id, newText) => {
    updateTodoState(id, { text: newText, isEditing: false });
  };

  const handleCancelEdit = (id) => {
    updateTodoState(id, { isEditing: false });
  };

  // -------------------------------------------------------------
  // 데이터 필터링 계산
  // -------------------------------------------------------------
  const targetDateStr = formatDateString(selectedDate);
  const filteredTodos = todos.filter((todo) => {
    if (todo.date !== targetDateStr) {
      return false;
    }
    if (currentFilter === 'active') {
      return !todo.completed;
    }
    if (currentFilter === 'completed') {
      return todo.completed;
    }
    return true;
  });

  return (
    <div className="todo-container bg-white w-full max-w-[480px] p-8 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.02)]">
      {/* 1. 헤더 */}
      <TodoHeader />

      {/* 2. 주간 네비게이터 */}
      <WeeklyNavigator
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        weekStartDate={weekStartDate}
        setWeekStartDate={setWeekStartDate}
        todos={todos}
      />

      {/* 3. 투두 추가 입력 폼 */}
      <TodoForm onAddTodo={handleAddTodo} />

      {/* 4. 상태별 필터 탭 영역 */}
      <div className="filter-container flex gap-1.5 mb-6 bg-slate-100 p-1 rounded-xl border border-slate-200">
        {['all', 'active', 'completed'].map((filter) => {
          const filterLabels = { all: '전체', active: '진행 중', completed: '완료' };
          const isActive = currentFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setCurrentFilter(filter)}
              className={`flex-1 border-none py-2 px-3 text-xs font-medium rounded-lg cursor-pointer transition-all duration-200 active:scale-98 ${
                isActive
                  ? 'bg-white text-brand font-semibold shadow-[0_2px_4px_rgba(0,0,0,0.04)]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {filterLabels[filter]}
            </button>
          );
        })}
      </div>

      {/* 5. 투두 리스트 목록 */}
      <main className="todo-main">
        <TodoList
          todos={filteredTodos}
          currentFilter={currentFilter}
          onToggleComplete={handleToggleComplete}
          onDeleteTodo={handleDeleteTodo}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onEnableEditMode={handleEnableEditMode}
        />
      </main>
    </div>
  );
}

export default App;
