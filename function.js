(async () => {
  let dlay = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
  }
  const swap = async (add) => {
    const active = document.querySelector(`.active${add}`);
    const actles = document.querySelector(`.inactive${add}`);

    await dlay(10);
    active.classList.remove(`active${add}`);
    active.classList.add(`inactive${add}`);

    actles.classList.remove(`inactive${add}`);
    actles.classList.add(`active${add}`);
  }

  document.querySelectorAll('.navButton').forEach(item => {
    item.addEventListener('click', () => {
      swap('BTN');
      swap('PGS');
    })
  })

  const getQuery = (params, fetched) => {
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const url = 'https://kbbi.web.id/';

    fetch(proxyUrl + encodeURIComponent(url) + params)
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(data, 'text/html');
        const queried = htmlDoc.getElementById('d1').innerHTML;
        let content = '';

        for (let i = 22; i < queried.length; i++) {
          if (
            queried[i + 0] == '<' &&
            queried[i + 1] == 'b' &&
            queried[i + 2] == 'r' &&
            queried[i + 3] == '>'
          ) break;
          else content += queried[i];
          fetch.innerHTML = content;
        }
        fetched.innerHTML = content;
      })
      .catch(error => console.log(error));
  }

  await dlay(10);
  const fetched = document.querySelector('.query');
  const input = document.querySelector('#inputMe');
  const click = document.querySelector('#clickMe');
  const parent = document.querySelector('.home-container');
  click.addEventListener('click', () => {
    try {
      parent.querySelector('.empty').classList.add('hidden');
      parent.querySelector('.query').classList.remove('hidden');
    } catch (err) {}

    getQuery(input.value.toLowerCase(), fetched);
  });
  input.addEventListener('input', () => {
    if (input.value.length == 0) {
      try {
        parent.querySelector('.empty').classList.remove('hidden');
        parent.querySelector('.query').classList.add('hidden');
      } catch (err) {}
    }
  })
})();