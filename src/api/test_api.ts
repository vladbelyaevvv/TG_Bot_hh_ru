async function fetchNewVacancies() {
  const url = new URL('https://api.hh.ru/vacancies');

  // Параметры запроса
  url.searchParams.append('text', 'TypeScript');
  url.searchParams.append('area', '1');        // Москва
  url.searchParams.append('per_page', '20');
  url.searchParams.append('page', '0');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Ошибка API: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

fetchNewVacancies()
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);