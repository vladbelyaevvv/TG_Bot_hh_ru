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

export async function searchVacancies(
    text: string,
    area: string = '1',
    perPage: number = 5
): Promise<VacancyResponse> {
    const url = new URL('https://api.hh.ru/vacancies');

    url.searchParams.append('text', text);
    url.searchParams.append('area', area);
    url.searchParams.append('per_page', perPage.toString());
    url.searchParams.append('page', '0');

     // сортировка по дате
    url.searchParams.append('order_by', 'publication_time');

    const response = await axios.get(url.toString(), {
        headers: {
            'User-Agent': 'JobHunterBot/1.0'
        }
    })

    if(response.status !== 200) {
        throw new Error(`Ошибка API hh.ru: ${response.status}`);
    }

    return response.data;
}