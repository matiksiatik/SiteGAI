// Получаем текущего пользователя
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
let bookings = JSON.parse(localStorage.getItem('techInspections')) || [];

// Элементы интерфейса
const userView = document.getElementById('userView');
const adminView = document.getElementById('adminView');
const userCarNumber = document.getElementById('userCarNumber');
const userBookingsContainer = document.getElementById('userBookings');
const scheduleContainer = document.getElementById('scheduleContainer');
const inspectionDate = document.getElementById('inspectionDate');
const inspectionTime = document.getElementById('inspectionTime');
const addScheduleBtn = document.getElementById('addScheduleBtn');
const adminSchedule = document.getElementById('adminSchedule');
const alertDiv = document.getElementById('alert');

// Установка дат
const today = new Date();
const maxDate = new Date('2025-12-31');
inspectionDate.min = today.toISOString().split('T')[0];
inspectionDate.max = maxDate.toISOString().split('T')[0];

// Проверка роли администратора
function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

// Получение идентификатора пользователя
function getUserId(user) {
    return `${user.name}_${user.surname}`;
}

// Инициализация интерфейса
function initInterface() {
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    if (isAdmin()) {
        userView.style.display = 'none';
        adminView.style.display = 'block';
        loadAdminSchedule();
    } else {
        userView.style.display = 'block';
        adminView.style.display = 'none';
        loadUserBookings();
        loadAvailableSlots();
    }
}

// Загрузка записей пользователя
function loadUserBookings() {
    userBookingsContainer.innerHTML = '';
    
    // Получаем записи текущего пользователя
    const userBookings = bookings.filter(booking => 
        booking.userId === getUserId(currentUser)
    );
    
    if (userBookings.length === 0) {
        userBookingsContainer.innerHTML = '<p>У вас нет записей на техосмотр</p>';
        return;
    }
    
    userBookings.forEach(booking => {
        const bookingElement = document.createElement('div');
        bookingElement.className = 'booking-item';
        bookingElement.innerHTML = `
            <p><strong>Дата:</strong> ${formatDate(booking.date)}</p>
            <p><strong>Время:</strong> ${booking.time}</p>
            <p><strong>Гос. номер:</strong> ${booking.carNumber || 'не указан'}</p>
            <button onclick="cancelBooking('${booking.id}')">Отменить запись</button>
        `;
        userBookingsContainer.appendChild(bookingElement);
    });
}

// Загрузка доступных слотов для записи
function loadAvailableSlots() {
    scheduleContainer.innerHTML = '';
    
    // Получаем слоты, где нет пользователя
    const availableSlots = bookings.filter(slot => !slot.userId);
    
    if (availableSlots.length === 0) {
        scheduleContainer.innerHTML = '<p>Нет доступных дат для записи</p>';
        return;
    }
    
    // Группируем по дате
    const slotsByDate = {};
    availableSlots.forEach(slot => {
        if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
        slotsByDate[slot.date].push(slot);
    });
    
    // Отображаем слоты
    for (const date in slotsByDate) {
        const dateElement = document.createElement('div');
        dateElement.innerHTML = `<h3>${formatDate(date)}</h3>`;
        
        const timeSlots = document.createElement('div');
        timeSlots.className = 'time-slots';
        
        slotsByDate[date].forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = 'time-slot';
            slotElement.textContent = slot.time;
            slotElement.onclick = () => bookSlot(slot.id);
            timeSlots.appendChild(slotElement);
        });
        
        dateElement.appendChild(timeSlots);
        scheduleContainer.appendChild(dateElement);
    }
}

// Запись на слот
function bookSlot(slotId) {
    const carNumber = userCarNumber.value.trim();
    if (!carNumber || !/^\d{4}[A-Z]{2}-\d$/.test(carNumber)) {
        showAlert('Введите корректный гос. номер (формат: 1111XX-1)', 'error');
        return;
    }
    
    // Проверяем, не записан ли уже пользователь
    const hasBooking = bookings.some(b => b.userId === getUserId(currentUser));
    if (hasBooking) {
        showAlert('Вы уже записаны на техосмотр', 'error');
        return;
    }
    
    const slotIndex = bookings.findIndex(s => s.id === slotId);
    if (slotIndex === -1 || bookings[slotIndex].userId) {
        showAlert('Это время уже занято', 'error');
        return;
    }
    
    // Записываем пользователя
    bookings[slotIndex].userId = getUserId(currentUser);
    bookings[slotIndex].carNumber = carNumber;
    saveBookings();
    
    showAlert('Вы успешно записаны!', 'success');
    loadUserBookings();
    loadAvailableSlots();
}

// Отмена записи
function cancelBooking(slotId) {
    const slotIndex = bookings.findIndex(s => s.id === slotId);
    if (slotIndex !== -1 && bookings[slotIndex].userId === getUserId(currentUser)) {
        bookings[slotIndex].userId = null;
        bookings[slotIndex].carNumber = null;
        saveBookings();
        
        showAlert('Запись отменена', 'success');
        loadUserBookings();
        loadAvailableSlots();
    }
}

// Админ: загрузка расписания
function loadAdminSchedule() {
    adminSchedule.innerHTML = '';
    
    // Группируем по дате
    const slotsByDate = {};
    bookings.forEach(slot => {
        if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
        slotsByDate[slot.date].push(slot);
    });
    
    // Отображаем все слоты
    for (const date in slotsByDate) {
        const dateElement = document.createElement('div');
        dateElement.innerHTML = `<h3>${formatDate(date)}</h3>`;
        
        const timeSlots = document.createElement('div');
        timeSlots.className = 'time-slots';
        
        slotsByDate[date].forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = `time-slot ${slot.userId ? 'booked' : ''}`;
            
            if (slot.userId) {
                const user = findUser(slot.userId);
                slotElement.innerHTML = `
                    ${slot.time}<br>
                    <small>${slot.carNumber || 'нет номера'}</small><br>
                    <small>${user ? `${user.name} ${user.surname}` : 'Неизвестный'}</small>
                `;
                slotElement.onclick = () => adminCancelBooking(slot.id);
            } else {
                slotElement.textContent = slot.time;
                slotElement.onclick = () => deleteSlot(slot.id);
            }
            
            timeSlots.appendChild(slotElement);
        });
        
        dateElement.appendChild(timeSlots);
        adminSchedule.appendChild(dateElement);
    }
}

// Админ: отмена чужой записи
function adminCancelBooking(slotId) {
    if (confirm('Отменить эту запись?')) {
        const slotIndex = bookings.findIndex(s => s.id === slotId);
        if (slotIndex !== -1) {
            bookings[slotIndex].userId = null;
            bookings[slotIndex].carNumber = null;
            saveBookings();
            showAlert('Запись отменена', 'success');
            loadAdminSchedule();
        }
    }
}

// Админ: удаление слота
function deleteSlot(slotId) {
    if (confirm('Удалить этот слот?')) {
        bookings = bookings.filter(s => s.id !== slotId);
        saveBookings();
        showAlert('Слот удален', 'success');
        loadAdminSchedule();
    }
}

// Админ: добавление слота
addScheduleBtn.addEventListener('click', () => {
    const date = inspectionDate.value;
    const time = inspectionTime.value;
    
    if (!date || !time) {
        showAlert('Заполните все поля', 'error');
        return;
    }
    
    // Проверка даты
    const selectedDate = new Date(date);
    if (selectedDate < today || selectedDate > maxDate) {
        showAlert('Дата должна быть между сегодня и 31.12.2025', 'error');
        return;
    }
    
    // Проверка на дублирование
    const exists = bookings.some(s => s.date === date && s.time === time);
    if (exists) {
        showAlert('Это время уже есть в расписании', 'error');
        return;
    }
    
    // Добавляем новый слот
    bookings.push({
        id: generateId(),
        date,
        time,
        userId: null,
        carNumber: null
    });
    
    saveBookings();
    showAlert('Слот добавлен', 'success');
    loadAdminSchedule();
    
    // Очищаем поля
    inspectionDate.value = '';
    inspectionTime.value = '';
});

// Вспомогательные функции
function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function showAlert(message, type) {
    alertDiv.textContent = message;
    alertDiv.style.color = type === 'error' ? 'var(--accent-color)' : 'green';
    setTimeout(() => alertDiv.textContent = '', 3000);
}

function saveBookings() {
    localStorage.setItem('techInspections', JSON.stringify(bookings));
}

function findUser(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.find(u => getUserId(u) === userId);
}
// Переход на главную страницу при нажатии на логотип
logo.addEventListener('click', () => {
    window.location.href = 'index.html';
});
// Инициализация
initInterface();