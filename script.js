/*
    Logica de programação

    [x] Pegar a informação do Input, quando o usuário clicar no botão de buscar ou apertar enter
    [x] Ir até a API e buscar as receitas 
    [x] Colocar receitas na tela 
    [x] Saber quando o usuário clicar em uma receita
    [x] Buscar informações da receita individual na API
    [x] Colocar a receita individual na tela
*/

const recipeList = document.querySelector('.recipe-list');
const input = document.querySelector('.search-input'); //  - agora usamos essa variável em vez de event.target[0].value
const form = document.querySelector('.search-form');
const recipeDetails = document.querySelector('.recipe-details');
const loading = document.querySelector('.loading'); //  - agora o loading é usado no JS

form.addEventListener('submit', function(event) {
    event.preventDefault();
    const inputValue = input.value; //  - usando a variável 'input' já declarada
    searchRecipes(inputValue);
});

async function searchRecipes(ingredient) {
    recipeDetails.innerHTML = ''; //  - limpa os detalhes da receita anterior
    recipeList.innerHTML = '';    // limpa os resultados anteriores

    //  - exibe o loading enquanto busca
    loading.textContent = 'Carregando...';
    loading.style.display = 'block';

    try { //  - try/catch para tratar erros de rede
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
        const data = await response.json();

        // [CORRIGIDO 1] - a mensagem de "não encontrado" agora aparece só se realmente não houver resultados
        if (data.meals) {
            showRecipes(data.meals);
        } else {
            recipeList.innerHTML = '<p>Nenhuma receita encontrada</p>';
        }
    } catch (error) {
        recipeList.innerHTML = '<p>Erro ao buscar receitas. Verifique sua conexão e tente novamente.</p>';
        console.error(error);
    } finally {
        // esconde o loading após concluir (com ou sem erro)
        loading.textContent = '';
        loading.style.display = 'none';
    }
}

function showRecipes(recipes) {
    recipeList.innerHTML = recipes.map(item => `
        <div class="recipe-card" onclick="getRecipeDetails(${item.idMeal})">
            <img src="${item.strMealThumb}" alt="receita-foto">
            <h3>${item.strMeal}</h3>  <!-- [CORRIGIDO 2] - tag <h3> com abertura correta -->
        </div>
    `).join('');
}

async function getRecipeDetails(id) {
    try { //  - try/catch também na busca de detalhes
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        const data = await response.json();
        const recipe = data.meals[0];

        let ingredients = '';

        for (let i = 1; i <= 20; i++) {
            if (recipe[`strIngredient${i}`]) {
                ingredients += `<li>${recipe[`strMeasure${i}`]} ${recipe[`strIngredient${i}`]}</li>`;
            } else {
                break;
            }
        }

        recipeDetails.innerHTML = `
            <h2>${recipe.strMeal}</h2>
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="recipe-img">
            <h3>Categoria: ${recipe.strCategory}</h3>   <!-- [CORRIGIDO 3] - tag <h3> com abertura correta -->
            <h3>Origem: ${recipe.strArea}</h3>
            <h3>Ingredientes:</h3>
            <ul>${ingredients}</ul>   <!-- [CORRIGIDO 4] - lista de ingredientes aparece só uma vez -->
            <h3>Instruções:</h3>
            <p>${recipe.strInstructions}</p>
            <p><strong>Tags:</strong> ${recipe.strTags || 'Sem tags'}</p>   <!-- [CORRIGIDO 5] - trata strTags null -->
            <p>Vídeo: <a href="${recipe.strYoutube}" target="_blank">Assistir</a></p>
        `;

        // Rola a tela até os detalhes da receita
        recipeDetails.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        recipeDetails.innerHTML = '<p>Erro ao carregar os detalhes da receita.</p>';
        console.error(error);
    }
}