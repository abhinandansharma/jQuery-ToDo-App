$(document).ready(function() {
    // App state
    let tasks = [];
    let currentFilter = 'all';
    
    // Cache DOM elements
    const $taskList = $('#task-list');
    const $newTaskInput = $('#new-task-input');
    const $addTaskBtn = $('#add-task-btn');
    const $taskCount = $('#task-count');
    const $emptyState = $('#empty-state');
    const $filterBtns = $('.filter-btn');
    const $clearCompletedBtn = $('#clear-completed');

    // Initialize app
    init();

    function init() {
        loadSampleTasks();
        bindEvents();
        updateTaskCount();
        updateUI();
    }

    function loadSampleTasks() {
        // Convert existing sample tasks to task objects and add proper data attributes
        $('.task-item').each(function(index) {
            const taskText = $(this).find('.task-text').text();
            const taskId = Date.now() + index;
            const task = {
                id: taskId,
                text: taskText,
                completed: false,
                timestamp: Date.now()
            };
            
            tasks.push(task);
            
            // Add the data-task-id attribute to the existing DOM element
            $(this).attr('data-task-id', taskId);
        });
    }

    function bindEvents() {
        // Add task on Enter key or button click
        $newTaskInput.on('keypress', function(e) {
            if (e.which === 13 && $(this).val().trim() !== '') {
                addTask($(this).val().trim());
                $(this).val('');
            }
        });

        $addTaskBtn.on('click', function() {
            const taskText = $newTaskInput.val().trim();
            if (taskText !== '') {
                addTask(taskText);
                $newTaskInput.val('');
            }
        });

        // Toggle task completion
        $taskList.on('click', '.task-checkbox', function(e) {
            e.stopPropagation();
            const taskId = $(this).closest('.task-item').data('task-id');
            toggleTask(taskId);
        });

        // Delete task
        $taskList.on('click', '.delete-btn', function(e) {
            e.stopPropagation();
            const $taskItem = $(this).closest('.task-item');
            const taskId = $taskItem.data('task-id');
            deleteTask(taskId, $taskItem);
        });

        // Filter tasks
        $filterBtns.on('click', function() {
            const filter = $(this).data('filter');
            setFilter(filter);
        });

        // Clear completed tasks
        $clearCompletedBtn.on('click', function() {
            clearCompletedTasks();
        });

        // Focus input when clicking add button
        $addTaskBtn.on('click', function() {
            $newTaskInput.focus();
        });
    }

    function addTask(text) {
        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            timestamp: Date.now()
        };

        tasks.unshift(task); // Add to beginning of array
        
        const $taskElement = createTaskElement(task);
        $taskElement.addClass('adding');
        
        if ($taskList.children().length === 0) {
            $taskList.append($taskElement);
        } else {
            $taskList.prepend($taskElement);
        }

        updateTaskCount();
        updateUI();
        
        // Show success feedback
        showNotification('Task added successfully!', 'success');
    }

    function createTaskElement(task) {
        return $(`
            <li class="task-item ${task.completed ? 'completed' : ''}" role="listitem" data-task-id="${task.id}">
                <div class="task-content">
                    <button class="task-checkbox ${task.completed ? 'checked' : ''}" aria-label="Mark as complete">
                        <svg class="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                    </button>
                    <span class="task-text">${escapeHtml(task.text)}</span>
                </div>
                <button class="delete-btn" aria-label="Delete task">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </li>
        `);
    }

    function toggleTask(taskId) {
        const task = tasks.find(t => t.id == taskId);
        if (task) {
            task.completed = !task.completed;
            
            const $taskItem = $(`.task-item[data-task-id="${taskId}"]`);
            const $checkbox = $taskItem.find('.task-checkbox');
            
            if (task.completed) {
                $taskItem.addClass('completed');
                $checkbox.addClass('checked');
                showNotification('Task completed! 🎉', 'success');
            } else {
                $taskItem.removeClass('completed');
                $checkbox.removeClass('checked');
                showNotification('Task marked as active', 'info');
            }

            updateTaskCount();
            updateUI();
        }
    }

    function deleteTask(taskId, $taskElement) {
        // Add removing animation
        $taskElement.addClass('removing');
        
        // Remove from tasks array after animation
        setTimeout(() => {
            tasks = tasks.filter(t => t.id != taskId);
            $taskElement.remove();
            updateTaskCount();
            updateUI();
            showNotification('Task deleted', 'info');
        }, 300);
    }

    function setFilter(filter) {
        currentFilter = filter;
        
        // Update active filter button
        $filterBtns.removeClass('active');
        $(`.filter-btn[data-filter="${filter}"]`).addClass('active');
        
        // Filter tasks
        filterTasks();
    }

    function filterTasks() {
        $('.task-item').each(function() {
            const $item = $(this);
            const taskId = $item.data('task-id');
            const task = tasks.find(t => t.id == taskId);
            
            if (!task) return;

            let shouldShow = false;
            
            switch (currentFilter) {
                case 'all':
                    shouldShow = true;
                    break;
                case 'active':
                    shouldShow = !task.completed;
                    break;
                case 'completed':
                    shouldShow = task.completed;
                    break;
            }

            if (shouldShow) {
                $item.show();
            } else {
                $item.hide();
            }
        });

        updateUI();
    }

    function clearCompletedTasks() {
        const completedTasks = $('.task-item.completed');
        
        if (completedTasks.length === 0) {
            showNotification('No completed tasks to clear', 'info');
            return;
        }

        // Add removing animation to all completed tasks
        completedTasks.addClass('removing');
        
        // Remove completed tasks after animation
        setTimeout(() => {
            tasks = tasks.filter(t => !t.completed);
            completedTasks.remove();
            updateTaskCount();
            updateUI();
            showNotification(`Cleared ${completedTasks.length} completed task(s)`, 'success');
        }, 300);
    }

    function updateTaskCount() {
        const activeTasks = tasks.filter(t => !t.completed).length;
        $taskCount.text(activeTasks);
        
        // Update clear completed button state
        const completedTasks = tasks.filter(t => t.completed).length;
        $clearCompletedBtn.prop('disabled', completedTasks === 0);
    }

    function updateUI() {
        const visibleTasks = $('.task-item:visible').length;
        
        if (visibleTasks === 0) {
            $emptyState.fadeIn(300);
            $taskList.hide();
        } else {
            $emptyState.fadeOut(300);
            $taskList.show();
        }

        // Update empty state message based on filter
        const $emptyTitle = $emptyState.find('h3');
        const $emptyText = $emptyState.find('p');
        
        switch (currentFilter) {
            case 'active':
                $emptyTitle.text('No active tasks!');
                $emptyText.text('All your tasks are completed. Great job!');
                break;
            case 'completed':
                $emptyTitle.text('No completed tasks!');
                $emptyText.text('Complete some tasks to see them here.');
                break;
            default:
                $emptyTitle.text('All caught up!');
                $emptyText.text('You have no tasks remaining. Great job!');
        }
    }

    function showNotification(message, type = 'info') {
        // Remove existing notifications
        $('.notification').remove();
        
        const $notification = $(`
            <div class="notification notification-${type}">
                ${escapeHtml(message)}
            </div>
        `);

        $('body').append($notification);
        
        // Show notification with animation
        setTimeout(() => {
            $notification.addClass('show');
        }, 100);

        // Hide notification after 3 seconds
        setTimeout(() => {
            $notification.removeClass('show');
            setTimeout(() => {
                $notification.remove();
            }, 300);
        }, 3000);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Add notification styles dynamically
    const notificationCSS = `
        <style>
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                font-size: 14px;
                z-index: 1000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-success {
                background: var(--success-color, #48bb78);
            }
            
            .notification-info {
                background: var(--primary-color, #667eea);
            }
            
            .notification-warning {
                background: var(--warning-color, #ed8936);
            }
            
            .notification-error {
                background: var(--danger-color, #f56565);
            }
            
            @media (max-width: 640px) {
                .notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    transform: translateY(-100%);
                }
                
                .notification.show {
                    transform: translateY(0);
                }
            }
        </style>
    `;
    
    $('head').append(notificationCSS);

    // Auto-focus input on page load
    setTimeout(() => {
        $newTaskInput.focus();
    }, 500);
});