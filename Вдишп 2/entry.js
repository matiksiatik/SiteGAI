const authContainer = document.getElementById('authContainer');
const loginForm = document.getElementById('loginForm');
const switchToRegister = document.getElementById('switchToRegister');

// Переключение на регистрацию
switchToRegister.addEventListener('click', () => {
    authContainer.innerHTML = `
        <h2>Регистрация</h2>
        <form id="registerForm">
            <input type="text" id="registerName" placeholder="Ваше имя" required>
            <input type="text" id="registerSurname" placeholder="Ваша фамилия" required>
            <input type="password" id="registerPassword" placeholder="Пароль" required>
            <input type="password" id="registerConfirmPassword" placeholder="Повторите пароль" required>
            <select id="registerRole">
                <option value="user">Пользователь</option>
                <option value="admin">Администратор</option>
            </select>
            <button type="submit">Зарегистрироваться</button>
        </form>
        <div class="switch-link" id="switchToLogin">Уже есть аккаунт? Войдите</div>
    `;
    document.getElementById('switchToLogin').addEventListener('click', renderLogin);
    document.getElementById('registerForm').addEventListener('submit', registerUser);
});

// Рендер страницы входа
function renderLogin() {
    authContainer.innerHTML = `
        <h2>Вход</h2>
        <form id="loginForm">
            <input type="text" id="loginName" placeholder="Имя" required>
            <input type="text" id="loginSurname" placeholder="Фамилия" required>
            <input type="password" id="loginPassword" placeholder="Пароль" required>
            <select id="loginRole">
                <option value="user">Пользователь</option>
                <option value="admin">Администратор</option>
            </select>
            <button type="submit">Войти</button>
        </form>
        <div class="switch-link" id="switchToRegister">Нет аккаунта? Зарегистрируйтесь</div>
    `;
    document.getElementById('switchToRegister').addEventListener('click', () => switchToRegister.click());
    document.getElementById('loginForm').addEventListener('submit', loginUser);
}

// Проверка на содержание только букв
function containsOnlyLetters(str) {
    return /^[a-zA-Zа-яА-Я]+$/.test(str);
}


// Функция регистрации пользователя
function registerUser(event) {
    event.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const surname = document.getElementById('registerSurname').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const role = document.getElementById('registerRole').value;

    // Проверка на символы в имени и фамилии
    if (!containsOnlyLetters(name) || !containsOnlyLetters(surname)) {
        alert('Имя и фамилия могут содержать только буквы!');
        return;
    }

    // Ограничение длины имени, фамилии и пароля
    if (name.length > 20 || surname.length > 20) {
        alert('Имя и фамилия не могут быть длиннее 20 символов!');
        return;
    }
    if (password.length > 20) {
        alert('Пароль не может быть длиннее 20 символов!');
        return;
    }

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
        alert('Пароли не совпадают!');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Проверка на существование пользователя с таким же именем и фамилией
    const userExists = users.some(user => user.name === name && user.surname === surname);
    if (userExists) {
        alert('Пользователь с таким именем и фамилией уже существует!');
        return;
    }

    // Проверка на существование администратора
    if (role === 'admin') {
        const adminExists = users.some(user => user.role === 'admin');
        if (adminExists) {
            alert('Администратор уже существует!');
            return;
        }
    }

    users.push({ name, surname, password, role });
    localStorage.setItem('users', JSON.stringify(users));

    alert('Регистрация успешна!');
    renderLogin();
}

// Функция входа пользователя
function loginUser(event) {
    event.preventDefault();
    const name = document.getElementById('loginName').value.trim();
    const surname = document.getElementById('loginSurname').value.trim();
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.name === name && u.surname === surname && u.password === password && u.role === role);

    if (user) {
        alert(`Добро пожаловать, ${name} ${surname}!`);
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'gai.html';
    } else {
        alert('Неправильное имя, фамилия, пароль или роль!');
    }
}

// Переход на главную страницу при нажатии на логотип
logo.addEventListener('click', () => {
    window.location.href = 'gai.html';
});

loginForm.addEventListener('submit', loginUser);
