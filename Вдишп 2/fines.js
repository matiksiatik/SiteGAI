// Получение текущего пользователя
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Получение элементов страницы
const finesList = document.getElementById('finesList');
const historyList = document.getElementById('historyList');

// Загрузка штрафов и истории
function loadFines() {
    const fines = currentUser.fines || [];
    finesList.innerHTML = '';

    if (fines.length === 0) {
        finesList.innerHTML = '<p>У вас нет штрафов.</p>';
        return;
    }

    fines.forEach((fine, index) => {
        const fineElement = document.createElement('div');
        fineElement.className = 'fine';
        fineElement.innerHTML = `
            <p>Штраф №${index + 1}: ${fine.type}</p>
            <p>Статус: ${fine.paid ? 'Оплачен' : 'Не оплачен'}</p>
            <button onclick="payFine(${index})" ${fine.paid ? 'disabled' : ''}>Оплатить</button>
        `;
        finesList.appendChild(fineElement);

    });
}

// Оплата штрафа
function payFine(index) {
    const fines = currentUser.fines;
    if (fines[index].paid) {
        alert('Этот штраф уже оплачен.');
        return;
    }

    // Помечаем штраф как оплаченный
    fines[index].paid = true;
    currentUser.fines = fines;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Обновляем данные в панели администратора
    updateAdminFines(currentUser);

    // Перезагружаем список штрафов
    loadFines();
    alert('Штраф успешно оплачен.');
}

// Обновление штрафов в панели администратора
function updateAdminFines(user) {
    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.name === user.name && u.surname === user.surname);

    if (userIndex !== -1) {
        users[userIndex] = user; // Обновляем данные пользователя
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Переход на главную страницу при нажатии на логотип
logo.addEventListener('click', () => {
    window.location.href = 'gai.html';
});

// Загрузка страницы
window.onload = () => {
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    loadFines();
};