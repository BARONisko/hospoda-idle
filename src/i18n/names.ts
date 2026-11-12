// Jména lidí podle jazyka (přání uživatele: v cizích jazycích žádní „Jirka Jelínek“, ale místní jména).
// Soupeři v lize: 12 mužských + 11 ženských + 1 mužské jméno (pořadí jako dřív v league.ts), příjmení, hospody.
// Číšníci: muž, žena, muž, žena (postavy waiter, waiterB, waiterC, waiterD).
import { lang, type Lang } from '../i18n';

interface Names {
  first: string[];
  last: string[];
  pubs: string[];
  waiters: [string, string, string, string];
  /** ženský tvar příjmení (cs, pl, ru) */
  fem?: (s: string) => string;
}

const N: Record<Lang, Names> = {
  cs: {
    first: ['Pepa', 'Franta', 'Jarda', 'Mirek', 'Láďa', 'Venca', 'Honza', 'Zdeněk', 'Karel', 'Standa', 'Jirka', 'Bohouš',
      'Marie', 'Jana', 'Hanka', 'Věra', 'Alena', 'Lenka', 'Zdena', 'Dana', 'Olga', 'Božena', 'Míla', 'Tonda'],
    last: ['Novák', 'Dvořák', 'Svoboda', 'Černý', 'Procházka', 'Kučera', 'Veselý', 'Horák', 'Němec', 'Pokorný',
      'Marek', 'Pospíšil', 'Hájek', 'Král', 'Jelínek', 'Růžička', 'Beneš', 'Fiala', 'Sedláček', 'Doležal'],
    pubs: ['U Lípy', 'U Zlatého soudku', 'Na Rychtě', 'U Tří volů', 'U Kance', 'Pod Kaštanem', 'U Pumpy', 'Na Růžku',
      'U Dvou koček', 'U Šneka', 'Na Hrázi', 'U Černého koně', 'U Bílé labutě', 'Na Staré poště', 'U Kocoura', 'Pod Věží'],
    waiters: ['Franta', 'Jarka', 'Bořek', 'Vilma'],
    fem: (s) => (s.endsWith('ý') ? s.slice(0, -1) + 'á' : s.endsWith('a') ? s.slice(0, -1) + 'ová' : s + 'ová'),
  },
  en: {
    first: ['Jack', 'Harry', 'Tom', 'Mike', 'Dave', 'Steve', 'Bill', 'Gary', 'Pete', 'Rob', 'Nick', 'Frank',
      'Mary', 'Kate', 'Sue', 'Linda', 'Sarah', 'Emma', 'Jenny', 'Lucy', 'Molly', 'Rose', 'Annie', 'Tony'],
    last: ['Smith', 'Jones', 'Brown', 'Taylor', 'Wilson', 'Evans', 'Walker', 'Wright', 'Hughes', 'Green',
      'Hall', 'Wood', 'Clarke', 'Turner', 'Baker', 'Cooper', 'Hill', 'Ward', 'Morgan', 'Parker'],
    pubs: ['The Red Lion', 'The Golden Keg', 'The Crown', 'The Three Oxen', 'The Wild Boar', 'The Old Oak', 'The Pump House', 'The Corner',
      'The Two Cats', 'The Snail', 'The Dam', 'The Black Horse', 'The White Swan', 'The Old Post', 'The Tomcat', 'The Tower'],
    waiters: ['Frank', 'Jenny', 'Bert', 'Wilma'],
  },
  de: {
    first: ['Hans', 'Klaus', 'Jürgen', 'Uwe', 'Dieter', 'Peter', 'Stefan', 'Michael', 'Thomas', 'Frank', 'Andreas', 'Horst',
      'Petra', 'Sabine', 'Monika', 'Heike', 'Andrea', 'Birgit', 'Karin', 'Ute', 'Renate', 'Gisela', 'Anja', 'Toni'],
    last: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',
      'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Neumann', 'Schwarz', 'Zimmermann', 'Krüger', 'Hartmann'],
    pubs: ['Zur Linde', 'Zum Goldenen Fass', 'Zum Krug', 'Zu den Drei Ochsen', 'Zum Keiler', 'Unter der Kastanie', 'Zur Pumpe', 'Eckkneipe',
      'Zu den Zwei Katzen', 'Zur Schnecke', 'Am Damm', 'Zum Schwarzen Ross', 'Zum Weißen Schwan', 'Alte Post', 'Zum Kater', 'Am Turm'],
    waiters: ['Franz', 'Jutta', 'Bernd', 'Wilma'],
  },
  es: {
    first: ['Pepe', 'Paco', 'Manolo', 'Juan', 'Luis', 'Javi', 'Toni', 'Carlos', 'Miguel', 'Rafa', 'Jorge', 'Andrés',
      'María', 'Carmen', 'Lola', 'Pilar', 'Ana', 'Lucía', 'Marta', 'Rosa', 'Elena', 'Isabel', 'Sara', 'Nacho'],
    last: ['García', 'Fernández', 'González', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín',
      'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Álvarez', 'Romero', 'Navarro', 'Torres', 'Ramos'],
    pubs: ['El Tilo', 'El Barril de Oro', 'La Posada', 'Los Tres Bueyes', 'El Jabalí', 'Bajo el Castaño', 'La Bomba', 'La Esquina',
      'Los Dos Gatos', 'El Caracol', 'La Presa', 'El Caballo Negro', 'El Cisne Blanco', 'La Vieja Posta', 'El Gato', 'La Torre'],
    waiters: ['Paco', 'Juana', 'Beto', 'Vilma'],
  },
  fr: {
    first: ['Jean', 'Pierre', 'Michel', 'Alain', 'Patrick', 'Philippe', 'Thierry', 'Éric', 'Didier', 'Pascal', 'Bruno', 'Gérard',
      'Marie', 'Nathalie', 'Isabelle', 'Sylvie', 'Catherine', 'Martine', 'Sophie', 'Valérie', 'Brigitte', 'Josette', 'Claire', 'Dédé'],
    last: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau',
      'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier'],
    pubs: ['Au Tilleul', 'Au Tonneau d\'Or', 'Le Relais', 'Aux Trois Bœufs', 'Au Sanglier', 'Sous le Marronnier', 'À la Pompe', 'Au Coin',
      'Aux Deux Chats', 'À l\'Escargot', 'Sur la Digue', 'Au Cheval Noir', 'Au Cygne Blanc', 'À la Vieille Poste', 'Au Matou', 'Sous la Tour'],
    waiters: ['Franck', 'Josette', 'Bruno', 'Violette'],
  },
  pt: {
    first: ['Zé', 'João', 'Chico', 'Tonho', 'Paulo', 'Marcos', 'Carlos', 'Beto', 'Rui', 'Tiago', 'Lucas', 'Jorge',
      'Maria', 'Ana', 'Rita', 'Joana', 'Sandra', 'Fátima', 'Carla', 'Luíza', 'Teresa', 'Helena', 'Bia', 'Tonico'],
    last: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Ferreira', 'Almeida', 'Carvalho', 'Gomes',
      'Martins', 'Rocha', 'Ribeiro', 'Lima', 'Barbosa', 'Araújo', 'Cardoso', 'Teixeira', 'Mendes', 'Nunes'],
    pubs: ['Bar da Tília', 'Barril de Ouro', 'A Taberna', 'Três Bois', 'O Javali', 'Sob o Castanheiro', 'Bar da Bomba', 'Bar da Esquina',
      'Dois Gatos', 'O Caracol', 'Bar da Represa', 'Cavalo Preto', 'Cisne Branco', 'Velho Correio', 'O Gatão', 'Bar da Torre'],
    waiters: ['Chico', 'Joana', 'Beto', 'Vilma'],
  },
  pl: {
    first: ['Janek', 'Zbyszek', 'Marek', 'Tomek', 'Krzysiek', 'Piotrek', 'Andrzej', 'Staszek', 'Wojtek', 'Mirek', 'Jurek', 'Bogdan',
      'Basia', 'Kasia', 'Gosia', 'Ania', 'Ewa', 'Jadzia', 'Krysia', 'Halina', 'Danuta', 'Grażyna', 'Ola', 'Tadek'],
    last: ['Nowak', 'Kowalski', 'Wiśniewski', 'Wójcik', 'Kowalczyk', 'Kamiński', 'Lewandowski', 'Zieliński', 'Szymański', 'Woźniak',
      'Dąbrowski', 'Kozłowski', 'Jankowski', 'Mazur', 'Kwiatkowski', 'Krawczyk', 'Piotrowski', 'Grabowski', 'Nowakowski', 'Pawłowski'],
    pubs: ['Pod Lipą', 'Pod Złotą Beczką', 'Karczma', 'Pod Trzema Wołami', 'Pod Dzikiem', 'Pod Kasztanem', 'Pod Pompą', 'Na Rogu',
      'Pod Dwoma Kotami', 'Pod Ślimakiem', 'Na Grobli', 'Pod Czarnym Koniem', 'Pod Białym Łabędziem', 'Stara Poczta', 'Pod Kocurem', 'Pod Wieżą'],
    waiters: ['Franek', 'Jadzia', 'Borys', 'Wiola'],
    fem: (s) => (s.endsWith('ski') || s.endsWith('cki') ? s.slice(0, -1) + 'a' : s),
  },
  ru: {
    first: ['Вася', 'Петя', 'Коля', 'Серёга', 'Миша', 'Саня', 'Дима', 'Витя', 'Лёха', 'Женя', 'Толик', 'Борис',
      'Маша', 'Галя', 'Люба', 'Нина', 'Света', 'Таня', 'Валя', 'Зина', 'Оля', 'Клава', 'Надя', 'Федя'],
    last: ['Иванов', 'Петров', 'Смирнов', 'Кузнецов', 'Попов', 'Соколов', 'Лебедев', 'Козлов', 'Новиков', 'Морозов',
      'Волков', 'Соловьёв', 'Васильев', 'Зайцев', 'Павлов', 'Семёнов', 'Голубев', 'Виноградов', 'Богданов', 'Воробьёв'],
    pubs: ['У Липы', 'Золотая бочка', 'Трактир', 'Три вола', 'Кабан', 'Под каштаном', 'У колонки', 'На углу',
      'Две кошки', 'Улитка', 'На плотине', 'Чёрный конь', 'Белый лебедь', 'Старая почта', 'Котофей', 'Под башней'],
    waiters: ['Фома', 'Жанна', 'Борис', 'Вера'],
    fem: (s) => s + 'а',
  },
  tr: {
    first: ['Ahmet', 'Mehmet', 'Mustafa', 'Hasan', 'Hüseyin', 'Ali', 'Osman', 'Murat', 'Kemal', 'Cem', 'Emre', 'Rıza',
      'Ayşe', 'Fatma', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Hülya', 'Sevgi', 'Gül', 'Nuran', 'Selma', 'Tolga'],
    last: ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir',
      'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek'],
    pubs: ['Ihlamur', 'Altın Fıçı', 'Han', 'Üç Öküz', 'Yaban Domuzu', 'Kestane Altı', 'Tulumba', 'Köşe',
      'İki Kedi', 'Salyangoz', 'Bent', 'Kara At', 'Beyaz Kuğu', 'Eski Postane', 'Tekir', 'Kule Dibi'],
    waiters: ['Ferhat', 'Jale', 'Bora', 'Vildan'],
  },
  ja: {
    first: ['タロウ', 'ケンジ', 'ヒロシ', 'マサオ', 'ゴロウ', 'テツ', 'シゲル', 'カズオ', 'ジロウ', 'サブロウ', 'ユウジ', 'イサム',
      'ハナコ', 'ヨシコ', 'ケイコ', 'アキコ', 'ミチコ', 'サチコ', 'ユキ', 'トモコ', 'カズコ', 'ウメ', 'ナオミ', 'トシ'],
    last: ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤',
      '吉田', '山田', '佐々木', '山口', '松本', '井上', '木村', '林', '清水', '山崎'],
    pubs: ['菩提樹', '金の樽', '宿場', '三頭牛', 'イノシシ', '栗の木', 'ポンプ', '角の店',
      '二匹の猫', 'カタツムリ', '堤', '黒馬', '白鳥', '旧郵便局', 'どら猫', '塔の下'],
    waiters: ['タロウ', 'ハナ', 'ジロウ', 'ユキ'],
  },
  ko: {
    first: ['철수', '영수', '민수', '동현', '성호', '재석', '광수', '병철', '상철', '정호', '대식', '덕배',
      '영희', '순자', '미숙', '지영', '은주', '혜진', '미경', '정숙', '말순', '옥자', '수진', '만수'],
    last: ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임',
      '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍'],
    pubs: ['보리수', '황금 술통', '주막', '세 마리 황소', '멧돼지', '밤나무 아래', '펌프집', '골목집',
      '고양이 두 마리', '달팽이', '둑방', '검은 말', '백조', '옛 우체국', '수고양이', '탑 아래'],
    waiters: ['철호', '지영', '병철', '미숙'],
  },
  zh: {
    first: ['建国', '志强', '国华', '大伟', '永刚', '小明', '海涛', '德胜', '宝山', '春生', '立新', '富贵',
      '秀英', '桂兰', '玉梅', '丽华', '美玲', '春花', '翠芬', '小燕', '红霞', '淑珍', '晓丽', '铁柱'],
    last: ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴',
      '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'],
    pubs: ['菩提树', '金酒桶', '老驿站', '三头牛', '野猪', '栗子树下', '水泵', '街角',
      '两只猫', '蜗牛', '河堤', '黑马', '白天鹅', '老邮局', '老猫', '塔下'],
    waiters: ['阿福', '小芳', '阿宝', '小薇'],
  },
};

export const NAMES: Names = N[lang] ?? N.en;
/** pořadí jména a příjmení (Asie: příjmení první, bez mezery v zh/ja) */
export function fullName(first: string, last: string, woman: boolean) {
  const l = woman && NAMES.fem ? NAMES.fem(last) : last;
  if (lang === 'zh' || lang === 'ja') return l + first;
  if (lang === 'ko') return l + first;
  return `${first} ${l}`;
}
