// Функция для получения всех рецептов с сервера
async function swou_recipe() {
    try {
        const response = await fetch('/api/recipes');
        const recipes = await response.json();
        displayRecipes(recipes);
    } catch (err) {
        console.error('Ошибка загрузки рецептов:', err);
        document.getElementById("result").innerHTML = "<p>Ошибка загрузки</p>";
    }
}

// Отображение рецептов на странице
function displayRecipes(recipes) {
    let output = "";
    recipes.forEach((item, index) => {
        output += `
            <div class="div_js">
                <strong>Название:</strong> ${item.title}
                <ul>
                    <li><strong>Ингредиенты:</strong> ${item.ingredients}</li>
                    <li><strong>Инструкция:</strong> ${item.instructions}</li>
                    <li><strong>Категория:</strong> ${item.category}</li>
                </ul>
                <button onclick="del_reception(${item.id})">Удалить</button>
            </div>`;
    });
    document.getElementById("result").innerHTML = output;
}

// Добавление рецепта
async function add_reception() {
    const recipe = {
        title: document.getElementById("name").value,
        ingredients: document.getElementById("ingredients").value,
        instructions: document.getElementById("manual").value,
        category: document.getElementById("category").value,
    };

    try {
        const response = await fetch('/api/recipes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recipe)
        });

        if (response.ok) {
            swou_recipe(); // обновить список
            // Очистить поля
            document.getElementById("name").value = "";
            document.getElementById("ingredients").value = "";
            document.getElementById("manual").value = "";
            document.getElementById("category").value = "";
        } else {
            alert('Ошибка добавления рецепта');
        }
    } catch (err) {
        console.error('Ошибка:', err);
    }
}

// Поиск по названию
async function get_reception_name() {
    const name = document.getElementById("search_name").value;
    try {
        const response = await fetch(`/api/recipes/search?name=${encodeURIComponent(name)}`);
        const recipes = await response.json();
        displayRecipes(recipes);
        document.getElementById("search_name").value = "";
    } catch (err) {
        console.error('Ошибка поиска:', err);
    }
}

// Фильтр по категории
async function get_reception_category() {
    const category = document.getElementById("search_category").value;
    try {
        const response = await fetch(`/api/recipes/category?category=${encodeURIComponent(category)}`);
        const recipes = await response.json();
        displayRecipes(recipes);
        document.getElementById("search_category").value = "";
    } catch (err) {
        console.error('Ошибка фильтрации:', err);
    }
}

// Удаление рецепта
async function del_reception(id) {
    try {
        const response = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
        if (response.ok) {
            swou_recipe(); // обновить список
        } else {
            alert('Ошибка удаления');
        }
    } catch (err) {
        console.error('Ошибка:', err);
    }
}

// Загрузка всех рецептов при старте
document.addEventListener('DOMContentLoaded', swou_recipe);