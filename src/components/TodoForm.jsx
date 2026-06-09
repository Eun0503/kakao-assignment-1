import { useState } from 'react';

function TodoForm({ onAddTodo }) {
  const [todoText, setTodoText] = useState('');
  const [formError, setFormError] = useState(''); // 로컬 유효성 경고 상태

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = todoText.trim();
    
    if (trimmed === '') {
      setFormError('할 일을 입력해주세요!');
      return;
    }

    setFormError('');
    onAddTodo(trimmed);
    setTodoText('');
  };

  const handleInputChange = (event) => {
    setTodoText(event.target.value);
    if (formError) {
      setFormError(''); // 입력 중 경고 초기화
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form mb-5">
      <div className="input-group flex gap-2">
        <input
          type="text"
          value={todoText}
          onChange={handleInputChange}
          placeholder="오늘 할 일을 입력하세요..."
          autoComplete="off"
          className="flex-1 py-3 px-4 text-sm border border-slate-200 rounded-lg outline-none transition-all duration-200 focus:border-brand"
        />
        <button
          type="submit"
          className="bg-brand hover:bg-brand-hover text-white border-none py-3 px-5 text-sm font-semibold rounded-lg cursor-pointer transition-colors duration-200 active:scale-98"
        >
          추가
        </button>
      </div>
      {/* 빈 입력값일 때 표시되는 안내 메시지 */}
      <p 
        className={`text-red-500 text-xs mt-2 h-4 transition-opacity duration-200 ${
          formError ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {formError}
      </p>
    </form>
  );
}

export default TodoForm;
