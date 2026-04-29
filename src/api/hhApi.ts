import axios from 'axios';

export interface Vacancy {
    id: string;
    name: string;
    employer: {
        name: string;
    };
    salary?:{
        from?: number;
        to?: number;
        currency: string;
    };
    alternate_url: string;
    published_at: string;
    snippet?: {
        requirement?: string;
        responsibility?: string;
    };
}

export interface VacancyResponse {
    items: Vacancy[];
    found: number;
    pages: number; // может и не надо это
}

export interface Area {
    id: string;
    name: string;
    areas: Area[];
}

const getHHHeaders = () => ({
    'Authorization': `Bearer ${process.env.HH_TOKEN}`,
    'HH-User-Agent': 'JobHunterBot/1.0 (vladbelyash5@gmail.com)',
    'User-Agent': 'JobHunterBot/1.0'
});

export async function searchVacancies(
    text: string,
    area: string = '113', // 113 - Россия
    perPage: number = 5,
    page: number = 0
): Promise<VacancyResponse> {
    const url = new URL('https://api.hh.ru/vacancies');

    url.searchParams.append('text', text);
    url.searchParams.append('area', area);
    url.searchParams.append('per_page', perPage.toString());
    url.searchParams.append('page', page.toString());

     // сортировка по дате
    url.searchParams.append('order_by', 'publication_time');

    const response = await axios.get(url.toString(), {
        headers: getHHHeaders()
    })

    if(response.status !== 200) {
        throw new Error(`Ошибка API hh.ru: ${response.status}`);
    }

    return response.data;
}

//рекурсивный поиск местности, чтобы обойти структуру: страна - регион - город
function searchInAreas(areas: Area[], cityName: string): {id: string, name: string} | null {
    for (const area of areas) {
        if(area.name.toLowerCase() === cityName.toLowerCase()) {
            return {id: area.id, name: area.name};
        }
        if(area.areas.length > 0) {
            const found = searchInAreas(area.areas, cityName);
            if (found) return found;
        }
    }
    return null;
}

export async function findAreaByName(cityName: string): Promise<{ id: string; name: string } | null> {
    const response = await axios.get('https://api.hh.ru/areas', {
        headers: getHHHeaders()
    })

    const areas: Area[] = response.data;
    return searchInAreas(areas, cityName);
}
