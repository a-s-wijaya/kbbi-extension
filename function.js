(async () => {
  const dlay = (time) => {return new Promise(resolve => setTimeout(resolve, time));}
  const container = document.querySelector('.container');

  /////////////////////////////////
  // Popup Handler
  // const popup = () => {
  //   chrome.windows.create({
  //     url: "popup.html",
  //     type: "popup",
  //     width: 365,
  //     height: 500,
  //     top: 0,
  //     left: 0,
  //     focused: true
  //   });
  // }
  // try {
  //   const popupBTN = document.querySelector('.pop-up');
  //   popupBTN.addEventListener('click', () => {
  //     popup();
  //   })
  // } catch (err) {}

  /////////////////////////////////
  // Scrollbar Handler
  document.querySelectorAll('.scroll-hover').forEach(item => {
    item.addEventListener('mouseover', () => {
      item.classList.add('scroll-on');
    })
    item.addEventListener('mouseout', () => {
      item.classList.remove('scroll-on');
    })
  })

  /////////////////////////////////
  // Profile Handler
  await dlay(10);
  const profileNAV = document.querySelector('#profile-nav');
  const profileUNO = document.querySelector('#profile-back');
  const profileBOX = document.querySelector('.profile');
  profileNAV.addEventListener('click', async () => {
    profileBOX.classList.remove('hidden');
    await dlay(10);
    profileBOX.style.translate = '0';
    profileBOX.style.opacity = '1';
  })
  profileUNO.addEventListener('click', async () => {
    profileBOX.style.translate = '-100vw 0';
    profileBOX.style.opacity = '0';
    await dlay(310);
    profileBOX.classList.add('hidden');
  })

  /////////////////////////////////
  // History Handler
  const historyEmpty = document.querySelector('.history-container .empty');
  const historyQuery = document.querySelector('.history-container .query');
  const  dataHistory = () => {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (searchHistory.length != 0) {
      try {
        // Hide Empty History Page
        historyEmpty.classList.add('hidden');
        historyQuery.classList.remove('hidden');

        let historyList = '';

        for (let i = 0; i < searchHistory.length; i++) {
          const check = searchHistory[i];

          ///////////////////////////
          // Separate Word Sections
          /* -- Word Slicer -- */
          const SoN = (k, req) => { 
            let res = false;
            let lng = req.length;
                     
            for (let m = 0; m < lng; m++) { 
              if (check[k-m] == req[lng-m-1]) res = true;
              else return false;
            }

            return res;
          }
          let title = '',
              subtl = '',
              exc   = true,
              tmp   = '',
              act   = false;

          for (let k = 0; k < check.length; k++) {
            // Title, if it was the first word that located between first <b></b>
            (() => {
              if (SoN(k-1,'</b>')) exc = false;
              else if (exc == true) title += check[k];
            })();

            // Subtitle, if it was located between two (") and there's no slash
            (() => {
              // Found '</em>' => Allow
              if (SoN(k-1,'</em>')) {act = true;}

              // Found ';' or ':' => Stop
              if ((check[k] == ';' || check[k] == ':') && tmp != '') {
                tmp += ';';
                subtl += tmp;
                act = false;
                tmp = '';
              }

              if (check[k-1] == '>') tmp = '';
                
              // Allowed => insert
              if (act == true) tmp += check[k];
            })();
          }
          
          (() => {
            title = title.slice(3,title.length-4);
          })();
          
          ////////////////////////////////
          // Push all Contents
          historyList += 
          `
          <div class="row history-list">
            <p class="history-prev">
              ${title}
            </p>
            <em class="history-sub">
              ${subtl}
            </em>

            <p class="history-show hidden">
              ${check}
            </p>
          </div>
          `;
        }
        historyQuery.innerHTML = historyList;
      } catch (err) {}
    }
  }

  /////////////////////////////////
  // Button Swap Pages Handler
  const swap = async (add) => {
    const active = document.querySelector(`.active${add}`);
    const actles = document.querySelector(`.inactive${add}`);

    await dlay(10);
    active.classList.remove(`active${add}`);
    active.classList.add(`inactive${add}`);
    
    actles.classList.remove(`inactive${add}`);
    actles.classList.add(`active${add}`);
  }

  document.querySelectorAll('.navButton').forEach((item,i) => {
    item.addEventListener('click', () => {
      if(i == 1) dataHistory();
      swap('BTN');
      swap('PGS');
    })
  })

  /////////////////////////////////
  // Fetching Handler
  let content = '';
  const getQuery = (params,fetched) => {
    content = '';
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const url = 'https://kbbi.web.id/';

    fetch(proxyUrl + url + params)
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(data, 'text/html');
        const queried = htmlDoc.getElementById('d1').innerHTML;
        let tmp = '';

        // End in one paragraph
        for (let i = 22; i < queried.length; i++) { 
          if (
            queried[i + 0] == '<' &&
            queried[i + 1] == 'b' &&
            queried[i + 2] == 'r' &&
            queried[i + 3] == '>'
          ) break;
          else tmp += queried[i];
        }
        content = tmp;
        fetched.innerHTML = content;

        // Search History Input
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        const index = searchHistory.indexOf(content);
        if (index !== -1) {
          searchHistory.splice(index, 1);
        }
        searchHistory.unshift(content);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
      })
      .catch(error => console.log(error));
  }

  /////////////////////////////////
  // Start Query Handler
  await dlay(10);
  const fetched = document.querySelector('.query');
  const input = document.querySelector('#inputMe');
  const click = document.querySelector('#clickMe');
  const parent = document.querySelector('.home-container');
  click.addEventListener('click', async () => {
    try {
      parent.querySelector('.empty').classList.add('hidden');
      parent.querySelector('.query').classList.remove('hidden');
    } catch (err) {}
    
    getQuery(input.value.toLowerCase(),fetched);

    while (content == '') {
      click.style.color = 'transparent';
      await dlay(300);
      click.style.color = 'inherit';
      await dlay(300);
    }
    click.style.color = 'inherit';
  });
  input.addEventListener('input', () => {
    if(input.value.length == 0) {
      try {
        parent.querySelector('.empty').classList.remove('hidden');
        parent.querySelector('.query').classList.add('hidden');
      } catch (err) {}
    }
  })
})();