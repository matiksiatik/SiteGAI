// Получение элементов страницы
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const profileName = document.getElementById('profileName');
const avatar = document.getElementById('avatar');
const avatarInput = document.getElementById('avatarInput');
const profileForm = document.getElementById('profileForm');
const logoutButton = document.getElementById('logout');
const logo = document.getElementById('logo');
const pageContainer = document.querySelector('.page-container');

// Загрузка данных пользователя
function loadUserData() {
    if (currentUser) {
        profileName.textContent = `${currentUser.name} ${currentUser.surname}`;
        if (currentUser.avatar) avatar.src = currentUser.avatar;
        document.getElementById('info').value = currentUser.info || '';
        document.getElementById('dob').value = currentUser.dob || '';
        document.getElementById('country').value = currentUser.country || '';

        // Проверка на администратора
        if (currentUser.role === 'admin') {
            showAdminPanel();
        }
    } else {
        window.location.href = 'index.html';
    }
}

// Сохранение изменений профиля
profileForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Получение данных из формы
    const info = document.getElementById('info').value;
    const dob = document.getElementById('dob').value;
    const country = document.getElementById('country').value;

    // Ограничение длины описания
    if (info.length > 100) {
        alert('Описание не может превышать 100 символов!');
        document.getElementById('info').value = currentUser.info || ''; // Сбрасываем значение
        return;
    }

    // Проверка возраста
    const today = new Date();
    const minDate = new Date('1901-01-01');
    const selectedDate = new Date(dob);

    if (selectedDate < minDate || selectedDate > today) {
        alert('Некорректная дата рождения!');
        document.getElementById('dob').value = currentUser.dob || ''; // Сбрасываем значение
        return;
    }

    // Если все проверки прошли успешно, сохраняем данные
    currentUser.info = info;
    currentUser.dob = dob;
    currentUser.country = country;
    saveCurrentUserChanges();
    alert('Изменения сохранены!');
});

// Функция сохранения изменений пользователя
function saveCurrentUserChanges() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(
        user => user.name === currentUser.name && user.surname === currentUser.surname
    );

    if (userIndex !== -1) {
        users[userIndex] = currentUser; // Обновляем данные пользователя
    } else {
        users.push(currentUser); // Добавляем нового пользователя
    }

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser)); // Обновляем текущего пользователя
}

// Переход на главную страницу при нажатии на логотип
logo.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Изменение аватарки
avatarInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            avatar.src = e.target.result;
            currentUser.avatar = e.target.result;
            saveCurrentUserChanges();
        };
        reader.readAsDataURL(file);
    }
});



// Выход из профиля
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});

// Функция отображения панели администратора
function showAdminPanel() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const adminContainer = document.createElement('div');
    adminContainer.classList.add('admin-container');
    adminContainer.innerHTML = '<h2>Список пользователей</h2>';

    const table = document.createElement('table');
    table.innerHTML = `
        <tr>
            <th>Имя</th>
            <th>Фамилия</th>
            <th>Действия</th>
        </tr>
    `;

    users.forEach((user, index) => {
        if (user.name !== 'Виктор' || user.surname !== 'Петрович') {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.surname}</td>
                <td>
                    <button class="admin-btn" onclick="addFine(${index})">Добавить штраф</button>
                    <button class="admin-btn" onclick="removeFine(${index})">Удалить штраф</button>
                </td>
            `;
            table.appendChild(row);
        }
    });

    adminContainer.appendChild(table);

    // Кнопка для отображения списка штрафов
    const toggleFinesButton = document.createElement('button');
    toggleFinesButton.className = 'toggle-fines-btn';
    toggleFinesButton.textContent = 'Показать штрафы';
    toggleFinesButton.addEventListener('click', () => {
        finesList.classList.toggle('hidden');
        toggleFinesButton.textContent = finesList.classList.contains('hidden') ? 'Показать штрафы' : 'Скрыть штрафы';
    });

    // Блок списка штрафов
    const finesList = document.createElement('div');
    finesList.classList.add('hidden', 'fines-list');
    updateFinesList(finesList);

    adminContainer.appendChild(toggleFinesButton);
    adminContainer.appendChild(finesList);
    pageContainer.appendChild(adminContainer);
}

// Функция обновления списка штрафов
function updateFinesList(finesList) {
    finesList.innerHTML = '<h2>Список штрафов</h2>';
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    users.forEach(user => {
        if (user.fines && user.fines.length > 0) {
            const unpaidFines = user.fines.filter(fine => !fine.paid); // Только неоплаченные штрафы
            if (unpaidFines.length > 0) {
                const fineCount = unpaidFines.length;
                const fineText = fineCount === 1 ? 'штраф' : (fineCount < 5 ? 'штрафа' : 'штрафов');
                const userFines = document.createElement('p');
                userFines.innerHTML = `<strong>${user.name} ${user.surname}:</strong> ${fineCount} ${fineText}`;
                finesList.appendChild(userFines);

                // Добавляем детализацию штрафов
                unpaidFines.forEach((fine, i) => {
                    const fineDetail = document.createElement('div');
                    fineDetail.className = 'fine-detail';
                    fineDetail.textContent = `${i + 1}. ${fine.type}`;
                    finesList.appendChild(fineDetail);
                });
            }
        }
    });
}
// Функция добавления штрафа
function addFine(index) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const fineTypes = [
        'Превышение скорости (10-20 км/ч) - 0.5 базовой величины',
        'Превышение скорости (20-30 км/ч) - 1 базовая величина',
        'Превышение скорости (30-40 км/ч) - 3 базовые величины',
        'Проезд на красный - от 1 до 5 базовой величины',
        'Парковка в неположенном месте - 1 базовая величина'
    ];

    const fine = prompt(`Выберите штраф:\n${fineTypes.map((type, i) => `${i + 1}. ${type}`).join('\n')}`);
    const fineIndex = parseInt(fine, 10) - 1;
    if (fineIndex >= 0 && fineIndex < fineTypes.length) {
        users[index].fines = users[index].fines || [];
        users[index].fines.push({ type: fineTypes[fineIndex], date: new Date().toLocaleDateString() });
        localStorage.setItem('users', JSON.stringify(users));

        // Обновляем текущего пользователя, если это администратор
        if (currentUser.name === 'Виктор' && currentUser.surname === 'Петрович') {
            const adminIndex = users.findIndex(u => u.name === 'Виктор' && u.surname === 'Петрович');
            if (adminIndex !== -1) {
                localStorage.setItem('currentUser', JSON.stringify(users[adminIndex]));
            }
        }

        // Обновляем список штрафов
        const finesList = document.querySelector('.fines-list');
        if (finesList) updateFinesList(finesList);
    }
}

// Функция удаления конкретного штрафа
function removeFine(index) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users[index].fines && users[index].fines.length > 0) {
        const fineToRemove = prompt(`Выберите штраф для удаления:\n${users[index].fines.map((fine, i) => `${i + 1}. ${fine.type}`).join('\n')}`);
        const fineIndex = parseInt(fineToRemove, 10) - 1;
        if (fineIndex >= 0 && fineIndex < users[index].fines.length) {
            users[index].fines.splice(fineIndex, 1);
            localStorage.setItem('users', JSON.stringify(users));

            // Обновляем текущего пользователя, если это администратор
            if (currentUser.name === 'Виктор' && currentUser.surname === 'Петрович') {
                const adminIndex = users.findIndex(u => u.name === 'Виктор' && u.surname === 'Петрович');
                if (adminIndex !== -1) {
                    localStorage.setItem('currentUser', JSON.stringify(users[adminIndex]));
                }
            }

            // Обновляем список штрафов
            const finesList = document.querySelector('.fines-list');
            if (finesList) updateFinesList(finesList);
        }
    } else {
        alert('У пользователя нет штрафов.');
    }
}

// Инициализация страницы
loadUserData();
