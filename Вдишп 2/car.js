const cars = JSON.parse(localStorage.getItem('cars')) || [];
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Допустимые типы двигателя
const validEngineTypes = ['бензиновый', 'дизельный', 'электрический'];

// Функция для поиска автомобиля
function searchCar() {
    const regNumber = document.getElementById('regNumber').value.trim();
    const alert = document.getElementById('alert');
    const carInfo = document.getElementById('carInfo');

    // Проверка формата номера
    if (!/^\d{4}[A-Z]{2}-\d$/.test(regNumber)) {
        alert.textContent = 'Неверный формат номера!';
        carInfo.innerHTML = '';
        return;
    }

    const car = cars.find(c => c.regNumber === regNumber);

    if (car) {
        alert.textContent = '';
        let carHTML = `
            <p><strong>Марка:</strong> ${car.brand}</p>
            <p><strong>Модель:</strong> ${car.model}</p>
            <p><strong>Год выпуска:</strong> ${car.year}</p>
            <p><strong>Объём двигателя:</strong> ${car.engine}</p>
            <p><strong>Тип двигателя:</strong> ${car.type}</p>
            <p><strong>Гос. номер:</strong> ${car.regNumber}</p>
            <img src="${car.image}" alt="Фото автомобиля">
        `;

        if (currentUser && currentUser.role === 'admin') {
            carHTML += `
                <div class="admin-controls">
                    <button class="action-button delete-btn" onclick="deleteCar('${car.regNumber}')">Удалить автомобиль</button>
                </div>
            `;
        }

        carInfo.innerHTML = carHTML;
    } else {
        alert.textContent = 'Автомобиль с таким номером не найден!';
        carInfo.innerHTML = '';
        
        if (currentUser && currentUser.role === 'admin') {
            document.getElementById('addCarButton').style.display = 'block';
        }
    }
}

function deleteCar(regNumber) {
    if (!confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
        return;
    }

    const carIndex = cars.findIndex(c => c.regNumber === regNumber);
    if (carIndex !== -1) {
        cars.splice(carIndex, 1);
        localStorage.setItem('cars', JSON.stringify(cars));
        alert('Автомобиль успешно удален!');
        document.getElementById('carInfo').innerHTML = '';
        document.getElementById('regNumber').value = '';
    }
}

function showAddCarForm() {
    document.getElementById('addCarButton').style.display = 'none';
    document.getElementById('addCarForm').style.display = 'block';
}

function addCar() {
    const brand = document.getElementById('brand').value.trim();
    const model = document.getElementById('model').value.trim();
    const year = parseInt(document.getElementById('year').value.trim(), 10);
    const engine = document.getElementById('engine').value.trim();
    const type = document.getElementById('type').value.trim().toLowerCase();
    const newRegNumber = document.getElementById('newRegNumber').value.trim();
    const carImage = document.getElementById('carImage').files[0];

    // Проверки
    if (!/^\d{4}[A-Z]{2}-\d$/.test(newRegNumber)) {
        alert('Неверный формат номера! Используйте формат: 1111XX-1');
        return;
    }
    if (!/^\d+\.\d$/.test(engine)) {
        alert('Неверный формат объёма двигателя! Используйте формат: 1.6 или 2.0');
        return;
    }
    if (year < 1886 || year > 2025) {
        alert('Неверный год выпуска! Допустимый диапазон: 1886-2025');
        return;
    }
    
    // Проверка типа двигателя
    if (!validEngineTypes.includes(type)) {
        alert('Неверный тип двигателя! Допустимые значения: бензиновый, дизельный, электрический');
        return;
    }

    // Проверка на существующий номер
    if (cars.some(c => c.regNumber === newRegNumber)) {
        alert('Автомобиль с таким номером уже существует!');
        return;
    }

    if (!carImage) {
        alert('Пожалуйста, выберите фото автомобиля!');
        return;
    }

    // Чтение фото
    const reader = new FileReader();
    reader.onload = function (e) {
        const newCar = {
            brand,
            model,
            year,
            engine,
            type,
            regNumber: newRegNumber,
            image: e.target.result
        };

        cars.push(newCar);
        localStorage.setItem('cars', JSON.stringify(cars));
        alert('Автомобиль успешно добавлен!');
        document.getElementById('addCarForm').style.display = 'none';
        // Очищаем форму
        document.getElementById('brand').value = '';
        document.getElementById('model').value = '';
        document.getElementById('year').value = '';
        document.getElementById('engine').value = '';
        document.getElementById('type').value = '';
        document.getElementById('newRegNumber').value = '';
        document.getElementById('carImage').value = '';
    };
    reader.readAsDataURL(carImage);
}

// Проверка на администратора
if (currentUser && currentUser.role === 'admin') {
    document.getElementById('addCarButton').style.display = 'block';
}
// Переход на главную страницу при нажатии на логотип
logo.addEventListener('click', () => {
    window.location.href = 'gai.html';
});