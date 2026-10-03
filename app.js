(function () {
  var def = [
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Yandex', url: 'https://yandex.ru' },
    { name: 'YouTube', url: 'https://youtube.com' }
  ];
  
  var grid = document.getElementById('grid');
  var ov = document.getElementById('ov');
  var bn = document.getElementById('bn');
  var bu = document.getElementById('bu');
  var q = document.getElementById('q');
  var box = document.getElementById('box');
  var res = document.getElementById('res');
  var ld = document.getElementById('ld');
  var goBtn = document.getElementById('go-btn');
  
  function getB() {
    try {
      return JSON.parse(localStorage.getItem('wn_b')) || def;
    } catch(e) {
      return def;
    }
  }
  
  function create(t, c, x) {
    var n = document.createElement(t);
    if(c) n.className = c;
    if(x) n.textContent = x;
    return n;
  }
  
  function render() {
    grid.innerHTML = '';
    getB().forEach(function (b, i) {
      var card = create('a', 'bookmark-card');
      card.href = b.url;
      
      var del = create('button', 'bookmark-delete', '×');
      del.type = 'button';
      del.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var l = getB();
        l.splice(i, 1);
        localStorage.setItem('wn_b', JSON.stringify(l));
        render();
      });
      
      card.appendChild(create('div', 'bookmark-icon', b.name ? b.name.charAt(0).toUpperCase() : '?'));
      card.appendChild(create('div', 'bookmark-title', b.name));
      card.appendChild(del);
      grid.appendChild(card);
    });
    
    var add = create('div', 'bookmark-card add-bookmark-btn');
    add.appendChild(create('div', 'bookmark-icon', '+'));
    add.appendChild(create('div', 'bookmark-title', 'Добавить'));
    add.addEventListener('click', function() {
      bn.value = '';
      bu.value = 'https://';
      ov.style.display = 'flex';
      bn.focus();
    });
    grid.appendChild(add);
  }

  async function doSearch() {
    var txt = q.value.trim();
    if(!txt) return;
    
    ld.textContent = 'Поиск ответов...';
    ld.style.display = 'block';
    res.style.display = 'none';
    grid.style.display = 'none';
    res.innerHTML = '';
    
    try {
      var ddgTarget = 'https://duckduckgo.com' + encodeURIComponent(txt);
      var r = await fetch('https://allorigins.win' + encodeURIComponent(ddgTarget));
      
      if (!r.ok) throw new Error();
      var json = await r.json(); 
      if (!json || !json.contents) throw new Error();

      var parser = new DOMParser(); 
      var doc = parser.parseFromString(json.contents, "text/html");
      var items = doc.querySelectorAll('.result'); 
      
      ld.style.display = 'none';
      box.classList.add('top');
      res.style.display = 'block';
      var found = false;
      
      items.forEach(function(item) {
        var linkEl = item.querySelector('.result__url');
        var titleEl = item.querySelector('.result__title');
        var snipEl = item.querySelector('.result__snippet');
        
        if (linkEl && titleEl) {
          var u = linkEl.getAttribute('href') || '';
          
          var idx = u.indexOf('uddg=');
          if (idx !== -1) {
            var remainder = u.substring(idx + 5);
            var ampIdx = remainder.indexOf('&');
            if (ampIdx !== -1) {
              remainder = remainder.substring(0, ampIdx);
            }
            u = decodeURIComponent(remainder);
          }
          
          if (u.indexOf('://duckduckgo.com') === -1 && u.indexOf('/') !== 0) {
            found = true; 
            var iDiv = create('div', 'result-item'); 
            iDiv.appendChild(create('div', 'result-url', u));
            
            var iLink = create('a', 'result-title', titleEl.textContent.trim()); 
            iLink.href = u; 
            iLink.target = '_blank'; 
            iDiv.appendChild(iLink);
            
            iDiv.appendChild(create('div', 'result-snippet', snipEl ? snipEl.textContent.trim() : '')); 
            res.appendChild(iDiv);
          }
        }
      });
      
      if(!found) {
        ld.textContent = 'По данному запросу ничего не найдено.';
        ld.style.display = 'block';
      }
    } catch(e) {
      ld.textContent = 'Ошибка шлюза.';
      ld.style.display = 'block';
    }
  }

  goBtn.addEventListener('click', doSearch); 
  q.addEventListener('keydown', function(e) {
    if(e.key === 'Enter') {
      e.preventDefault();
      doSearch();
    }
  });
  
  document.getElementById('bc').addEventListener('click', function() {
    ov.style.display = 'none';
  });
  
  document.getElementById('bs').addEventListener('click', function() {
    var n = bn.value.trim();
    var u = bu.value.trim();
    if (!n || !u) return;
    var l = getB();
    l.push({ name: n, url: u.match(/^https?:\/\//i) ? u : 'https://' + u });
    localStorage.setItem('wn_b', JSON.stringify(l));
    ov.style.display = 'none';
    render();
  });
  
  ov.addEventListener('click', function(e) {
    if(e.target === ov) ov.style.display = 'none';
  });
  
  render();
})();
