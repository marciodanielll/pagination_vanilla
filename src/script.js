const INITIAL_END_POINT = 'https://rickandmortyapi.com/api/character/?page=1';

const getCharacters = async (endPoint = INITIAL_END_POINT) => {
  try {
    console.log('endPoint chamada', endPoint);
    const response = await fetch(endPoint);
    const result = await response.json();
    return result;
  } catch (err) {
    console.error(`Error requesting resource ${endPoint}`);
    return err;
  }
};

const handlerDataPaginationLS = {
  set: (info) => localStorage.setItem('infoPagination', JSON.stringify(info)),
  get: () => JSON.parse(localStorage.getItem('infoPagination')),
};

const getCurrentEndPoint = () => {
  const baseUrl = 'https://rickandmortyapi.com/api/character/?page';
  const { next, prev } = handlerDataPaginationLS.get();
  if (next) {
    return `${baseUrl}=${Number(next.split('=')[1]) - 1}`;
  }
  return `${baseUrl}=${Number(prev.split('=')[1]) + 1}`;
};

const createCard = ({ name, image, gender, status, species }) => {
  const card = document.createElement('li');
  card.className = 'card';

  const h2 = document.createElement('h2');
  h2.innerText = name;
  card.appendChild(h2);

  const img = document.createElement('img');
  img.src = image;
  card.appendChild(img);

  const p1 = document.createElement('p');
  p1.innerText = `Gender: ${gender}`;
  card.appendChild(p1);

  const p2 = document.createElement('p');
  p2.innerText = `Status: ${status}`;
  card.appendChild(p2);

  const p3 = document.createElement('p');
  p3.innerText = `Specie:${species}`;
  card.appendChild(p3);

  return card;
};

const createListCards = (characters) => {
  const list = document.querySelector('#ul_characters');
  list.innerHTML = '';

  characters.forEach((current) => {
    list.appendChild(createCard(current));
  });
};

const handlerLimitNextPrev = () => {
  const { next, prev } = handlerDataPaginationLS.get();
  const nextButton = document.getElementById('next_pagination');
  const prevButton = document.getElementById('prev_pagination');
  nextButton.disabled = !next;
  prevButton.disabled = !prev;
};

const handlerPositionPagination = (currentPage, amount = 9) => {
  const { pages: limit } = handlerDataPaginationLS.get();
  const middle = Math.floor(amount / 2);
  const left = Number(currentPage) - middle;
  const right = Number(currentPage) + middle;
  return { middle,
    limit,
    left: () => {
      if (left < 1) return 1;
      if (left > limit - (middle * 2)) return limit - (middle * 2);
      return left;
    },
    right: () => {
      if (right < amount) return amount;
      if (right > limit) return limit;
      return right;
    },
  };
};

const createPagination = () => {
  const pagination = document.getElementById('nav_pagination');
  pagination.innerHTML = ' ';

  const currentPage = getCurrentEndPoint().split('=')[1];
  const { left, right, limit } = handlerPositionPagination(currentPage);
  
  const buttons = Array.from({ length: limit }, (_, i) => i + 1);

  buttons.slice(left() - 1, right()).forEach((numberPage) => {
    const button = document.createElement('button');
    button.innerText = numberPage;
    if (numberPage === +currentPage) {
      button.style.backgroundColor = 'black';
      button.style.color = 'white';
    }
    pagination.appendChild(button);
  });
};

const handlerNextButton = () => {
  const nextButton = document.getElementById('next_pagination');
  nextButton.addEventListener('click', async () => {
    const { next } = handlerDataPaginationLS.get();
    const { info, results: characters } = await getCharacters(next);
    handlerDataPaginationLS.set(info);
    createListCards(characters);
    createPagination();
    handlerLimitNextPrev();
  });
};

const handlerPrevButton = () => {
  const prevButton = document.getElementById('prev_pagination');
  prevButton.addEventListener('click', async () => {
    const { prev } = handlerDataPaginationLS.get();
    const { info, results: characters } = await getCharacters(prev);
    handlerDataPaginationLS.set(info);
    createListCards(characters);
    createPagination();
    handlerLimitNextPrev();
  });
};

const handlerFirstRequest = async () => {
  const dataPagination = handlerDataPaginationLS.get();

  if (!dataPagination) {
    const { info, results: characters } = await getCharacters();
    handlerDataPaginationLS.set(info);
    createListCards(characters);
  } else {
    const { info, results: characters } = await getCharacters(getCurrentEndPoint());
    handlerDataPaginationLS.set(info);
    createListCards(characters);
  }
  createPagination();
  handlerNextButton();
  handlerPrevButton();
  handlerLimitNextPrev();
};

window.onload = () => {
  handlerFirstRequest();
};
