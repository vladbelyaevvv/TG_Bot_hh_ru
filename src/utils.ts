import { Vacancy } from "./api/hhApi";

export function formatVacancyCard(vacancy: Vacancy, isNew = false): string {
    const salary = formatSalary(vacancy.salary);
    const employer = vacancy.employer?.name || 'Не указана';
    const date = new Date(vacancy.published_at).toLocaleDateString('ru-RU');
    const badge = isNew ? '🆕 ' : '';

    return `*${badge}${vacancy.name}*
🏢 ${employer}
💰 ${salary || 'Зарплата не указана'}
📅 ${date}
🔗 Ссылка: ${vacancy.alternate_url}`;
}

export function formatVacanciesList(vacancies: Vacancy[], offset = 0): string {
  const items = vacancies.map((v, i) => `${offset + i + 1}. ${formatVacancyCard(v)}`).join('\n\n');
  return items;
}

export function formatSalary(salary?: { 
    from?: number; 
    to?: number; 
    currency: string }): string {
    if (!salary) return '';

    const currencySymbols: Record<string, string> = {
        'RUR': '₽',
        'USD': '$',
        'EUR': '€'
    }

    const symbol = currencySymbols[salary.currency] || salary.currency;

    if(salary.from && salary.to) {
        return `${salary.from.toLocaleString('ru-RU')} - ${salary.to.toLocaleString('ru-RU')} ${symbol}`;
    }
    if(salary.from){
        return `от ${salary.from.toLocaleString('ru-RU')} ${symbol}`;
    }
    if (salary.to) {
        return `до ${salary.to.toLocaleString('ru-RU')} ${symbol}`;
    }

    return '';
};

