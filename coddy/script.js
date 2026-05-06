// ================== Gerenciamento da To-Do List ==================
    let tasks = [];
    let currentFilter = 'all';
    let editingId = null;  // id da tarefa em edição

    // Carregar do localStorage
    function loadTasks() {
        const stored = localStorage.getItem('flowDailyTasks');
        if(stored) {
            tasks = JSON.parse(stored);
        } else {
            // tarefas diárias de exemplo com beber agua e atividade fisica
            tasks = [
                { id: Date.now()+1, text: "💧 Beber 2 litros de água", completed: false, priority: "alta" },
                { id: Date.now()+2, text: "🏃‍♀️ Fazer 30 minutos de exercício", completed: false, priority: "alta" },
                { id: Date.now()+3, text: "🧘 Meditação e respiração", completed: false, priority: "media" },
                { id: Date.now()+4, text: "📖 Ler 15 minutos", completed: true, priority: "baixa" }
            ];
        }
    }

    function saveTasks() {
        localStorage.setItem('flowDailyTasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        const container = document.getElementById('tasksList');
        if(!container) return;
        
        let filtered = [...tasks];
        if(currentFilter === 'pendentes') filtered = tasks.filter(t => !t.completed);
        if(currentFilter === 'concluidas') filtered = tasks.filter(t => t.completed);
        
        if(filtered.length === 0) {
            container.innerHTML = `<div class="empty-message"><i class="fa-regular fa-face-smile"></i> Nenhuma tarefa aqui. Adicione hábitos saudáveis!</div>`;
            return;
        }
        
        let html = '';
        filtered.forEach(task => {
            let priorityClass = '';
            if(task.priority === 'alta') priorityClass = 'priority-alta';
            else if(task.priority === 'media') priorityClass = 'priority-media';
            else priorityClass = 'priority-baixa';
            
            let priorityLabel = task.priority === 'alta' ? '🔴 Alta' : (task.priority === 'media' ? '🟠 Média' : '🔵 Baixa');
            const checked = task.completed ? 'checked' : '';
            const completedClass = task.completed ? 'completed-task' : '';
            
            html += `
                <div class="task-item ${priorityClass} ${completedClass}" data-id="${task.id}">
                    <input type="checkbox" class="task-check" ${checked} data-id="${task.id}">
                    <div class="task-text" data-id-for-edit="${task.id}">${escapeHtml(task.text)}</div>
                    <div class="task-priority">${priorityLabel}</div>
                    <div class="task-actions">
                        <button class="edit-task" data-edit-id="${task.id}" title="Editar"><i class="fa-regular fa-pen-to-square"></i></button>
                        <button class="delete-task" data-del-id="${task.id}" title="Excluir"><i class="fa-regular fa-trash-can"></i></button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }
    
    function escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if(m === '&') return '&amp;';
            if(m === '<') return '&lt;';
            if(m === '>') return '&gt;';
            return m;
        }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, c => c);
    }
    
    // Adicionar tarefa (ou atualizar se editing)
    function addOrUpdateTask() {
        const inputEl = document.getElementById('newTaskText');
        const prioritySelect = document.getElementById('taskPriority');
        let text = inputEl.value.trim();
        if(text === "") {
            alert("Escreva uma tarefa ou use os atalhos rápidos!");
            return false;
        }
        const priority = prioritySelect.value;
        
        if(editingId !== null) {
            // atualizar tarefa existente
            const index = tasks.findIndex(t => t.id === editingId);
            if(index !== -1) {
                tasks[index].text = text;
                tasks[index].priority = priority;
                saveTasks();
                editingId = null;
                const addBtn = document.getElementById('addTaskBtn');
                addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar';
                addBtn.style.background = "linear-gradient(105deg, #8b5cf6, #c084fc)";
                inputEl.value = '';
                renderTasks();
            } else {
                editingId = null;
                addOrUpdateTask();
            }
        } else {
            const newTask = {
                id: Date.now(),
                text: text,
                completed: false,
                priority: priority
            };
            tasks.unshift(newTask);
            saveTasks();
            inputEl.value = '';
            renderTasks();
        }
        return true;
    }
    
    function toggleComplete(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if(task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    }
    
    function deleteTask(taskId) {
        tasks = tasks.filter(t => t.id !== taskId);
        if(editingId === taskId) {
            editingId = null;
            const addBtn = document.getElementById('addTaskBtn');
            addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar';
            addBtn.style.background = "linear-gradient(105deg, #8b5cf6, #c084fc)";
            document.getElementById('newTaskText').value = '';
        }
        saveTasks();
        renderTasks();
    }
    
    function startEditTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if(!task) return;
        document.getElementById('newTaskText').value = task.text;
        document.getElementById('taskPriority').value = task.priority;
        editingId = task.id;
        const addBtn = document.getElementById('addTaskBtn');
        addBtn.innerHTML = '<i class="fa-regular fa-floppy-disk"></i> Atualizar';
        addBtn.style.background = "linear-gradient(105deg, #f97316, #facc15)";
        document.getElementById('newTaskText').focus();
    }
    
    // Event delegation na lista de tarefas
    function bindTaskEvents() {
        const container = document.getElementById('tasksList');
        if(!container) return;
        container.addEventListener('click', (e) => {
            const check = e.target.closest('.task-check');
            if(check && check.dataset.id) {
                toggleComplete(parseInt(check.dataset.id));
                e.stopPropagation();
                return;
            }
            const delBtn = e.target.closest('.delete-task');
            if(delBtn && delBtn.dataset.delId) {
                deleteTask(parseInt(delBtn.dataset.delId));
                e.stopPropagation();
                return;
            }
            const editBtn = e.target.closest('.edit-task');
            if(editBtn && editBtn.dataset.editId) {
                startEditTask(parseInt(editBtn.dataset.editId));
                e.stopPropagation();
                return;
            }
            const textDiv = e.target.closest('.task-text');
            if(textDiv && textDiv.dataset.idForEdit) {
                startEditTask(parseInt(textDiv.dataset.idForEdit));
                e.stopPropagation();
            }
        });
    }
    
    // filtros
    function setupFilters() {
        const filters = document.querySelectorAll('.filter-chip');
        filters.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterValue = btn.dataset.filter;
                if(filterValue === 'all') currentFilter = 'all';
                else if(filterValue === 'pendentes') currentFilter = 'pendentes';
                else if(filterValue === 'concluidas') currentFilter = 'concluidas';
                filters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderTasks();
            });
        });
    }
    
    // Gerenciar menu de cores interativo (altera cores principais do tema)
    function setupColorMenu() {
        const root = document.documentElement;
        const colorOptions = document.querySelectorAll('.color-option');
        // predefinições elegantes
        const themes = {
            default: { primary: '#7c3aed', secondary: '#c084fc', gradient: 'linear-gradient(105deg, #8b5cf6, #c084fc)', bgStart: '#f5f3ff', bgEnd: '#e9eaff' },
            vida: { primary: '#10b981', secondary: '#34d399', gradient: 'linear-gradient(105deg, #10b981, #6ee7b7)', bgStart: '#ecfdf5', bgEnd: '#d1fae5' },
            energia: { primary: '#f59e0b', secondary: '#fbbf24', gradient: 'linear-gradient(105deg, #f59e0b, #fcd34d)', bgStart: '#fffbeb', bgEnd: '#fef3c7' },
            calma: { primary: '#06b6d4', secondary: '#22d3ee', gradient: 'linear-gradient(105deg, #06b6d4, #67e8f9)', bgStart: '#ecfeff', bgEnd: '#cffafe' },
            romance: { primary: '#ec489a', secondary: '#f472b6', gradient: 'linear-gradient(105deg, #ec489a, #f9a8d4)', bgStart: '#fdf2f8', bgEnd: '#fce7f3' }
        };
        
        function applyTheme(themeKey) {
            const theme = themes[themeKey];
            if(!theme) return;
            document.body.style.background = `linear-gradient(145deg, ${theme.bgStart} 0%, ${theme.bgEnd} 100%)`;
            const addBtn = document.getElementById('addTaskBtn');
            if(addBtn && !editingId) addBtn.style.background = theme.gradient;
            const filterActive = document.querySelector('.filter-chip.active');
            if(filterActive) filterActive.style.background = theme.primary;
            const quickBtns = document.querySelectorAll('.quick-btn');
            quickBtns.forEach(btn => btn.style.transition = '0.2s');
            // atualizar variáveis css para elementos dinâmicos
            root.style.setProperty('--primary-focus', theme.primary);
            // Mudar accent do checkbox (usando estilo inline)
            const styleSheet = document.createElement('style');
            styleSheet.textContent = `.task-check { accent-color: ${theme.primary} !important; } .filter-chip.active { background: ${theme.primary} !important; } .btn-add-task { background: ${theme.gradient} !important; }`;
            const oldStyle = document.getElementById('dynamicTheme');
            if(oldStyle) oldStyle.remove();
            styleSheet.id = 'dynamicTheme';
            document.head.appendChild(styleSheet);
        }
        
        colorOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                const colorType = opt.dataset.color;
                if(colorType === 'default') applyTheme('default');
                else if(colorType === 'vida') applyTheme('vida');
                else if(colorType === 'energia') applyTheme('energia');
                else if(colorType === 'calma') applyTheme('calma');
                else if(colorType === 'romance') applyTheme('romance');
                colorOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
            });
        });
        // aplicar default ativo
        const defaultOption = document.querySelector('.color-option[data-color="default"]');
        if(defaultOption) defaultOption.classList.add('active');
        applyTheme('default');
    }
    
    // Botões rápidos (beber agua, atividade fisica)
    function setupQuickButtons() {
        const quickContainer = document.getElementById('quickButtons');
        if(!quickContainer) return;
        quickContainer.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const taskText = btn.dataset.task;
                const priority = btn.dataset.priority || 'media';
                if(taskText) {
                    const newTask = {
                        id: Date.now(),
                        text: taskText,
                        completed: false,
                        priority: priority
                    };
                    tasks.unshift(newTask);
                    saveTasks();
                    renderTasks();
                    // feedback visual
                    btn.style.transform = 'scale(0.95)';
                    setTimeout(() => { btn.style.transform = ''; }, 150);
                }
            });
        });
    }
    
    // reset edição ao clicar no campo de texto limpo? se usuário digitar novo e editar estava ativo, oferecer cancelamento
    function handleCancelEdit() {
        const inputField = document.getElementById('newTaskText');
        if(inputField) {
            inputField.addEventListener('focus', () => {
                if(editingId !== null) {
                    if(confirm("Editando uma tarefa no momento. Deseja cancelar a edição e criar uma nova?")) {
                        editingId = null;
                        document.getElementById('addTaskBtn').innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar';
                        document.getElementById('addTaskBtn').style.background = "linear-gradient(105deg, #8b5cf6, #c084fc)";
                        inputField.value = '';
                        document.getElementById('taskPriority').value = 'media';
                    }
                }
            });
        }
    }
    
    // Inicializacao
    document.addEventListener('DOMContentLoaded', () => {
        loadTasks();
        renderTasks();
        bindTaskEvents();
        setupFilters();
        setupColorMenu();
        setupQuickButtons();
        handleCancelEdit();
        
        const addBtn = document.getElementById('addTaskBtn');
        addBtn.addEventListener('click', () => addOrUpdateTask());
        
        const taskInputText = document.getElementById('newTaskText');
        taskInputText.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                e.preventDefault();
                addOrUpdateTask();
            }
        });
    });