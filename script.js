document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task');
    const digitalClock = document.getElementById('digital-clock');
    const pomodoroTime = document.getElementById('pomodoro-time');
    const pomodoroToggleButton = document.getElementById('pomodoro-toggle');
    const pomodoroResetButton = document.getElementById('pomodoro-reset');

    let pomodoroTimer;
    let pomodoroMinutes = 25; // Default work period
    let pomodoroSeconds = 0;
    let isPomodoroRunning = false;
    let isPomodoroPaused = false;
    let pauseStartTime = 0;
    let totalDuration = 0;

    // Update digital clock every second
    setInterval(() => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        digitalClock.textContent = `${hours}:${minutes}:${seconds}`;
    }, 1000);

    // Add task on Enter key press
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    // Handle Tab and Delete key events
    document.addEventListener('keydown', (event) => {
        const activeTask = document.activeElement;
        if (event.key === 'Tab') {
            // Navigate through tasks
            event.preventDefault();
            const tasks = document.querySelectorAll('#task-list li');
            let index = Array.from(tasks).indexOf(activeTask);
            index = (index + 1) % tasks.length;
            tasks[index].focus();
        } else if (event.key === 'Delete') {
            // Delete the focused task
            if (activeTask && activeTask.tagName === 'LI') {
                activeTask.querySelector('.delete-btn').click();
            }
        }
    });

    // Toggle Pomodoro Timer (Start/Pause)
    window.togglePomodoro = function() {
        if (isPomodoroRunning) {
            // Pause
            if (!isPomodoroPaused) {
                isPomodoroRunning = false;
                isPomodoroPaused = true;
                clearInterval(pomodoroTimer);
                pauseStartTime = new Date().getTime();
                pomodoroToggleButton.textContent = 'Start';
            } else {
                // Resume
                isPomodoroRunning = true;
                isPomodoroPaused = false;
                pomodoroTimer = setInterval(() => {
                    if (pomodoroSeconds === 0) {
                        if (pomodoroMinutes === 0) {
                            clearInterval(pomodoroTimer);
                            isPomodoroRunning = false;
                            pomodoroTime.textContent = 'Time\'s up!';
                            updateDuration();
                            pomodoroToggleButton.textContent = 'Start';
                            return;
                        }
                        pomodoroMinutes--;
                        pomodoroSeconds = 59;
                    } else {
                        pomodoroSeconds--;
                    }
                    updatePomodoroTime();
                }, 1000);
                pomodoroToggleButton.textContent = 'Pause';
            }
        } else {
            // Start
            isPomodoroRunning = true;
            isPomodoroPaused = false;
            pomodoroTimer = setInterval(() => {
                if (pomodoroSeconds === 0) {
                    if (pomodoroMinutes === 0) {
                        clearInterval(pomodoroTimer);
                        isPomodoroRunning = false;
                        pomodoroTime.textContent = 'Time\'s up!';
                        updateDuration();
                        return;
                    }
                    pomodoroMinutes--;
                    pomodoroSeconds = 59;
                } else {
                    pomodoroSeconds--;
                }
                updatePomodoroTime();
            }, 1000);
            pomodoroToggleButton.textContent = 'Pause';
        }
    };

    // Reset Pomodoro Timer
    function resetPomodoro() {
        clearInterval(pomodoroTimer);
        isPomodoroRunning = false;
        isPomodoroPaused = false;
        pomodoroMinutes = 25; // Reset to default 25 minutes
        pomodoroSeconds = 0;
        updatePomodoroTime();
        pomodoroToggleButton.textContent = 'Start';
    }

    // Update Pomodoro Timer Display
    function updatePomodoroTime() {
        const minutesString = String(pomodoroMinutes).padStart(2, '0');
        const secondsString = String(pomodoroSeconds).padStart(2, '0');
        pomodoroTime.textContent = `${minutesString}:${secondsString}`;
    }

    // Update Duration for Pause
    function updateDuration() {
        if (pauseStartTime === 0) return;
        const pauseEndTime = new Date().getTime();
        const durationMillis = pauseEndTime - pauseStartTime;
        totalDuration += durationMillis;
        const durationSeconds = Math.floor(totalDuration / 1000);
        const durationMinutes = Math.floor(durationSeconds / 60);
        const durationHours = Math.floor(durationMinutes / 60);
        const days = Math.floor(durationHours / 24);

        let timeString = '';
        if (days > 0) {
            timeString += `${days}d `;
        }
        if (durationHours > 0) {
            timeString += `${durationHours % 24}h `;
        }
        if (durationMinutes > 0) {
            timeString += `${durationMinutes % 60}m `;
        }
        timeString += `${durationSeconds % 60}s`;

        // Optionally display the duration somewhere, or just use it for logging/debugging
        console.log(`Total Duration: ${timeString}`);
        pauseStartTime = 0; // Reset pause start time
    }

    // Add Task to List
    function addTask() {
        const taskInput = document.getElementById('new-task');
        const taskText = taskInput.value.trim();

        if (taskText === '') {
            alert('Please enter a task');
            return;
        }

        const taskList = document.getElementById('task-list');
        const li = document.createElement('li');
        li.tabIndex = 0;  // Make list item focusable

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checkbox';
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                li.classList.add('completed');
            } else {
                li.classList.remove('completed');
            }
        });

        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
        const taskName = document.createElement('span');
        taskName.className = 'task-name';
        taskName.textContent = taskText;

        const taskTime = document.createElement('span');
        taskTime.className = 'task-time';
        const startTime = new Date();
        taskTime.textContent = `Added just now`;

        taskContent.appendChild(checkbox);
        taskContent.appendChild(taskName);
        taskContent.appendChild(taskTime);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = function() {
            taskList.removeChild(li);
        };

        li.appendChild(taskContent);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);

        taskInput.value = '';

        setInterval(() => {
            const currentTime = new Date();
            const elapsedTime = currentTime - startTime;
            const seconds = Math.floor(elapsedTime / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            let timeString = '';
            if (days > 0) {
                timeString += `${days}d `;
            }
            if (hours > 0) {
                timeString += `${hours % 24}h `;
            }
            if (minutes > 0) {
                timeString += `${minutes % 60}m `;
            }
            timeString += `${seconds % 60}s ago`;

            taskTime.textContent = `Added ${timeString}`;
        }, 1000);
    }

    // Bind Reset button click event
    pomodoroResetButton.addEventListener('click', resetPomodoro);
});
