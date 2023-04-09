(async () => {
  const dlay = (time) => {return new Promise(resolve => setTimeout(resolve, time));}
  const container = document.querySelector('.container');

  /////////////////////////////////
  // Popup Handler
  const popup = () => {
    chrome.windows.create({
      url: "popup.html",
      type: "popup",
      width: 365,
      height: 500,
      top: 0,
      left: 0,
      focused: true
    });
  }
  try {
    const popupBTN = document.querySelector('.pop-up');
    popupBTN.addEventListener('click', () => {
      popup();
    })
  } catch (err) {}

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

  ///////////////
  // Divider
  const SoN = (k, req, text) => { 
    let res = false;
    let lng = req.length;
    for (let m = 0; m < lng; m++) { 
      if (text[k-m] == req[lng-m-1]) res = true;
      else return false;
    }
    return res;
  }

  /////////////////////////////////
  // Fetching Handler
  let content = '';
  const getQuery = (params,fetched) => {
    content = '';
    fetched.innerHTML = '';
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const url = 'https://kbbi.web.id/';

    fetch(proxyUrl + url + params)
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(data, 'text/html');
        try {
          const queried = htmlDoc.getElementById('d1').innerHTML;
          let tmps = '';

          // End in one paragraph
          for (let i = 22; i < queried.length; i++) { 
            if (
              queried[i + 0] == '<' &&
              queried[i + 1] == 'b' &&
              queried[i + 2] == 'r' &&
              queried[i + 3] == '>'
            ) break;
            else tmps += queried[i];
          }
          content = tmps;

          let legal = 0,
              subtl = [],
              title = '',
              tmp   = '',
              exc   = true,
              act   = false;
        
          for (let k = 0; k < content.length; k++) {
            //////////
            // Title, if it was the first word that located between first <b></b>
            (() => {
              if (SoN(k-1,'</b>', content) && exc == true) {exc = false; legal = k}
              else if (exc == true) title += content[k];
            })();

            //////////
            // Subtitle, if it was located between two (") and there's no slash
            (() => {
              //////////
              // Found '</em>' => Allow
              if (SoN(k-1,'</em>', content) && subtl.length < 4 && tmp == '') {
                act = true;
              } 
              if (SoN(k-1,'</b>', content) && (exc == false) && (tmp == '') && (k > legal) && (subtl.length < 4)) {
                act = true;
              }
      
              //////////
              // Found ';' => Stop
              if (((k == content.length-1) && tmp.length > 0) ||
                (SoN(k-1,'<b>', content) && tmp.length > 4)|| 
                (SoN(k-1,'</em>', content) && tmp.length > 15)
                
                && tmp != '' && act == true) { 
                subtl.push(tmp);
                act = false;
                tmp = '';
              }

              //////////
              // Found </b> => Reset
              if (SoN(k-1,'</b>', content)) {tmp = '';} 

              //////////
              // Found ':' => Space
              if (act == true && content[k-1] == ':') tmp += '<br>';
                
              //////////
              // Allowed => Insert
              if (act == true) tmp += content[k];

            })();
          }

          
          if (title.startsWith('>')) title = title.substring(1);
          const titled = document.createElement('h2');
          titled.innerHTML = title;

          const subtitles = document.createElement('div');
          
          subtl.forEach((item,i) => {
            const subtitle = document.createElement('div');
            subtitle.classList.add('row');
            
            const num = document.createElement('div');
            num.style.width = '5%';
            num.innerHTML = `<b>${i+1}</b>`;

            const box = document.createElement('div');
            box.style.width = '90%';
            const text = document.createElement('p');
            text.innerHTML = item;
            box.appendChild(text);

            subtitle.appendChild(num);
            subtitle.appendChild(box);
            subtitles.appendChild(subtitle);
          })

          fetched.appendChild(titled);
          fetched.appendChild(subtitles);
          const store = [content,fetched.innerHTML,title]
          
          // Search History Input
          const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];  
          const index = searchHistory.findIndex(member => member.includes(title));
          if (index !== -1) searchHistory.splice(index, 1);

          searchHistory.unshift(store);
          localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        } catch (err) {console.log(err)}
      })
  }

  /////////////////////////////////
  // History Handler
  const historyEmpty = document.querySelector('.history-container .empty');
  const historyQuery = document.querySelector('.history-container .query');
  const dataHistory = () => {
    
    const storage = JSON.parse(localStorage.getItem('searchHistory')) || [];
    
    try {
      if(storage.length > 0) {
        // Hide Empty History Page
        historyEmpty.classList.add('hidden');
        historyQuery.classList.remove('hidden');

        let historyList = '';

        for (let i = 0; i < storage.length; i++) {
          const text = storage[i][0];
          let title = '',
              subtl = '',
              tmp   = '',
              exc   = true,
              act   = false;
        
          for (let k = 0; k < text.length; k++) {
            //////////
            // Title, if it was the first word that located between first <b></b>
            (() => {
              if (SoN(k-1,'</b>', text)) exc = false;
              else if (exc == true) title += text[k];
            })();
        
            //////////
            // Subtitle, if it was located between two (") and there's no slash
            (() => {
              //////////
              // Found '</em>' => Allow
              if (SoN(k-1,'</em>', text)) {act = true;} 
      
              //////////
              // Found ';' or ':' => Stop
              if ((text[k] == ';' || text[k] == ':') && tmp != '') { 
                tmp += ';';
                subtl += tmp;
                act = false;
                tmp = '';
              }
      
              //////////
              // Found '>' => Reset
              if (text[k-1] == '>') tmp = '';
                
              //////////
              // Allowed => insert
              if (act == true) tmp += text[k];
            })();
          }
          
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
              ${text}
            </p>
          </div>
          `;
        }
        historyQuery.innerHTML = historyList;
      }
    } catch (err) {}
  }
  const dataDirect = () => {
    const storage = JSON.parse(localStorage.getItem('searchHistory')) || [];

    try {
      if(storage.length > 0) {
        document.querySelectorAll('.history-list').forEach((item,i) => {
          item.addEventListener('click', async () => {
            const requery = document.querySelector('.requery');
            requery.classList.remove('hidden');
            await dlay(10);
            requery.style.translate = '0';
            requery.style.opacity = '1';
  
            const requeryBack = document.querySelector('#requery-back');
            requeryBack.addEventListener('click', async () => {
              requery.style.translate = '-100vw 0';
              requery.style.opacity = '0';
              await dlay(310);
              requery.classList.add('hidden');
            })
  
            const requeryBody = document.querySelector('.requery-body');
            requeryBody.innerHTML = storage[i][1];
          })
        })
      }
    } catch (err) {}
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
      if(i == 1) {dataHistory();dataDirect();}
      swap('BTN');
      swap('PGS');
    })
  })

  /////////////////////////////////
  // Start Query Handler
  await dlay(10);
  const fetched = document.querySelector('.home-query');
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
    parent.querySelector('.empty').classList.remove('hidden');
    parent.querySelector('.query').classList.add('hidden');
    }
  })
  input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      click.click();
    }
  });
})();