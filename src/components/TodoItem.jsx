import { useState, useEffect, useRef } from 'react';

function TodoItem({ todo, onToggleComplete, onDeleteTodo, onSaveEdit, onCancelEdit, onEnableEditMode }) {
  const [editText, setEditText] = useState(todo.text);
  const [itemError, setItemError] = useState(''); // 개별 아이템 유효성 경고 상태
  const editInputRef = useRef(null);

  // 부모로부터 들어온 todo props 값 변경 시 상태를 렌더링 단계에서 안전하게 동기화 (useEffect 경고 해결)
  const [prevText, setPrevText] = useState(todo.text);
  const [prevIsEditing, setPrevIsEditing] = useState(todo.isEditing);

  if (todo.text !== prevText || todo.isEditing !== prevIsEditing) {
    setPrevText(todo.text);
    setPrevIsEditing(todo.isEditing);
    setEditText(todo.text);
    setItemError('');
  }

  // 수정 모드로 들어갈 때 자동으로 포커싱하고 커서를 맨 끝으로 이동
  useEffect(() => {
    if (todo.isEditing && editInputRef.current) {
      editInputRef.current.focus();
      const valueLength = editInputRef.current.value.length;
      editInputRef.current.setSelectionRange(valueLength, valueLength);
    }
  }, [todo.isEditing]);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed === '') {
      setItemError('할 일을 입력해주세요!');
      return;
    }
    setItemError('');
    onSaveEdit(todo.id, trimmed);
  };

  const handleCancel = () => {
    setItemError('');
    onCancelEdit(todo.id);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleInputChange = (e) => {
    setEditText(e.target.value);
    if (itemError) {
      setItemError(''); // 입력 중 경고 초기화
    }
  };

  return (
    <li className={`todo-item flex flex-col py-3 px-4 border border-slate-200 rounded-lg bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] transition-shadow duration-200 gap-2 hover:shadow-md ${todo.completed ? 'completed' : ''}`}>
      {todo.isEditing ? (
        // 3-1. 수정 모드일 때의 HTML 구성 (에러 레이아웃 포함)
        <div className="flex flex-col w-full gap-2">
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="todo-left flex items-center gap-3 flex-1">
              <input
                ref={editInputRef}
                type="text"
                value={editText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="edit-input flex-1 py-1.5 px-3 text-sm border border-brand rounded-md outline-none"
              />
            </div>
            <div className="btn-group flex gap-1.5 shrink-0">
              <button
                onClick={handleSave}
                className="save-btn border-none py-1.5 px-3 text-xs font-medium rounded-md cursor-pointer bg-brand text-white transition-colors duration-200 hover:bg-brand-hover active:scale-95"
              >
                저장
              </button>
              <button
                onClick={handleCancel}
                className="border-none py-1.5 px-3 text-xs font-medium rounded-md cursor-pointer bg-slate-50 text-slate-500 transition-colors duration-200 hover:bg-slate-200 hover:text-slate-800 active:scale-95"
              >
                취소
              </button>
            </div>
          </div>
          {itemError && (
            <p className="text-red-500 text-xs pl-1 animate-fade-in">
              {itemError}
            </p>
          )}
        </div>
      ) : (
        // 3-2. 일반 보기 모드일 때의 HTML 구성
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="todo-left flex items-center gap-3 flex-1 min-w-0">
            <span className={`todo-text text-sm break-all text-slate-800 ${todo.completed ? 'text-slate-500 line-through' : ''}`}>
              {todo.text}
            </span>
          </div>
          <div className="btn-group flex gap-1.5 shrink-0">
            <button
              onClick={() => onToggleComplete(todo.id)}
              className={`complete-btn border-none py-1.5 px-3 text-xs font-medium rounded-md cursor-pointer bg-slate-50 text-slate-500 transition-colors duration-200 hover:bg-slate-200 hover:text-slate-800 active:scale-95 ${
                todo.completed ? 'bg-green-50! text-green-700!' : ''
              }`}
            >
              {todo.completed ? '해제' : '완료'}
            </button>
            <button
              onClick={() => onEnableEditMode(todo.id)}
              className="border-none py-1.5 px-3 text-xs font-medium rounded-md cursor-pointer bg-slate-50 text-slate-500 transition-colors duration-200 hover:bg-slate-200 hover:text-slate-800 active:scale-95"
            >
              수정
            </button>
            <button
              onClick={() => onDeleteTodo(todo.id)}
              className="delete-btn border-none py-1.5 px-3 text-xs font-medium rounded-md cursor-pointer bg-slate-50 text-slate-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-500 active:scale-95"
            >
              삭제
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export default TodoItem;
