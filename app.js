(function () {
  'use strict';

  var Telegram = window.Telegram && window.Telegram.WebApp;
  var STORAGE_KEY = 'durov_game_save';

  var state = {
    level: 0,
    children: 0,
    muscles: 0,
    telegram: 0,
    ton: 0,
    location: 'home'
  };

  var goals = {
    level: 100,
    children: 100,
    muscles: 100,
    telegram: 100,
    ton: 1000
  };

  var gain = {
    muscles: 2,
    telegram: 3,
    ton: 25,
    children: 1
  };

  var messages = {
    muscles: {
      home: ['Поднял гантель. Паша бы одобрил.', 'Жим в квартире. Соседи стучат.', 'Мышца дрожит. Растёт.'],
      gym: ['Штанга в руки. Боль в радость.', 'Беговая дорожка скрипит. Пот льётся.', 'Ещё один подход. Ещё десять.']
    },
    telegram: {
      home: ['Пишешь код на стареньком компе. MTProto уже в голове.', 'Комп гудит. Сервера — пока мечта.', 'Строка за строкой. Мессенджер рождается.'],
      cave: ['Сервера мигают. Telegram живёт.', 'Деплой. Юзеры подключаются.', 'Код летит в прод. Дуров улыбается.']
    },
    ton: {
      cave: ['Смотришь график. TON ползёт вверх.', 'Кто не купил — опоздал. Ты не опоздал.', 'Крипта. Луна. $1000 не предел.'],
      apps: ['Открыл кошелёк. Цифры радуют.', 'TON в портфеле. Жизнь хороша.']
    },
    children: {
      home: ['Мечтаешь о большой семье. Как у Павла. Очень большой.', 'Кровать знает твои планы. 100 детей — не шутка.', 'Во сне уже слышишь крики детей. Много детей.'],
      apps: ['Свайп вправо. Ещё один. Род Дуровых множится.', 'Знакомства работают. Счётчик детей ползёт.', 'Приложение говорит: у тебя будет 100. И будет.']
    },
    viewMuscles: ['Смотришь в зеркало. Мышцы есть. Будут ещё.', 'Бицепс приветствует. Качайся дальше.', 'Зеркало не врёт. Ты растешь.']
  };

  function applyTheme() {
    if (!Telegram) return;
    document.body.style.backgroundColor = Telegram.themeParams.bg_color || '';
    document.body.style.color = Telegram.themeParams.text_color || '';
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      addLog('Прогресс сохранён.');
      if (Telegram) Telegram.HapticFeedback.notificationOccurred('success');
    } catch (e) {
      addLog('Не удалось сохранить.');
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        state.level = Math.min(parsed.level || 0, goals.level);
        state.children = Math.min(parsed.children || 0, goals.children);
        state.muscles = Math.min(parsed.muscles || 0, goals.muscles);
        state.telegram = Math.min(parsed.telegram || 0, goals.telegram);
        state.ton = Math.min(parsed.ton || 0, goals.ton);
        state.location = parsed.location || 'home';
      }
    } catch (e) {}
  }

  function updateLevel() {
    var m = state.muscles / goals.muscles;
    var t = state.telegram / goals.telegram;
    var tonNorm = state.ton / goals.ton;
    var c = state.children / goals.children;
    state.level = Math.min(Math.floor((m + t + tonNorm + c) / 4 * 100), goals.level);
  }

  function addLog(text) {
    var log = document.getElementById('log');
    if (!log) return;
    var p = document.createElement('p');
    p.textContent = text;
    log.insertBefore(p, log.firstChild);
    while (log.children.length > 25) log.removeChild(log.lastChild);
  }

  function pickMsg(key, loc) {
    var group = messages[key];
    if (!group) return key;
    if (Array.isArray(group)) return group[Math.floor(Math.random() * group.length)];
    var list = group[loc] || group.home || group.cave || group.apps;
    if (!list || !list.length) return key;
    return list[Math.floor(Math.random() * list.length)];
  }

  function doAction(actionName, fromPhone) {
    var loc = fromPhone ? 'apps' : state.location;
    if (actionName === 'muscles') {
      state.muscles = Math.min(state.muscles + gain.muscles, goals.muscles);
      addLog(pickMsg('muscles', loc === 'cave' ? 'gym' : loc));
    } else if (actionName === 'telegram') {
      state.telegram = Math.min(state.telegram + gain.telegram, goals.telegram);
      addLog(pickMsg('telegram', loc === 'apps' ? 'cave' : loc));
    } else if (actionName === 'ton') {
      state.ton = Math.min(state.ton + gain.ton, goals.ton);
      addLog(pickMsg('ton', loc));
    } else if (actionName === 'children') {
      state.children = Math.min(state.children + gain.children, goals.children);
      addLog(pickMsg('children', loc));
    } else if (actionName === 'view-muscles') {
      addLog(pickMsg('viewMuscles', null));
    }
    updateLevel();
    renderStatsPanels();
    renderPhoneStats();
    checkWin();
    if (Telegram) Telegram.HapticFeedback.impactOccurred('light');
  }

  function checkWin() {
    if (state.level >= goals.level && state.children >= goals.children &&
        state.muscles >= goals.muscles && state.telegram >= goals.telegram &&
        state.ton >= goals.ton) {
      document.getElementById('win-overlay').classList.remove('hidden');
      if (Telegram) Telegram.HapticFeedback.notificationOccurred('success');
    }
  }

  function showLocation(id) {
    state.location = id;
    document.querySelectorAll('.location').forEach(function (el) {
      el.classList.toggle('active', el.id === 'location-' + id);
    });
    save();
  }

  function openPhone() {
    document.getElementById('phone-overlay').classList.remove('hidden');
    showPhonePage('stats');
    renderPhoneStats();
    if (Telegram) Telegram.HapticFeedback.impactOccurred('light');
  }

  function closePhone() {
    document.getElementById('phone-overlay').classList.add('hidden');
  }

  function openLaptop() {
    document.getElementById('laptop-overlay').classList.remove('hidden');
    loadLottieLaptop();
    if (Telegram) Telegram.HapticFeedback.impactOccurred('light');
  }

  function closeLaptop() {
    document.getElementById('laptop-overlay').classList.add('hidden');
  }

  var lottieLaptopLoaded = false;
  function loadLottieLaptop() {
    if (lottieLaptopLoaded || !window.lottie) return;
    var container = document.getElementById('lottie-laptop');
    if (!container || container.children.length > 0) return;
    lottie.loadAnimation({
      container: container,
      renderer: 'svg',
      loop: true,
      path: 'assets/laptop.json',
      autoplay: true
    });
    lottieLaptopLoaded = true;
  }

  var lottieCharacterLoaded = false;
  function loadLottieCharacter() {
    if (lottieCharacterLoaded || !window.lottie) return;
    var container = document.getElementById('lottie-character');
    if (!container) return;
    var anim = lottie.loadAnimation({
      container: container,
      renderer: 'svg',
      loop: true,
      path: 'assets/character1.json',
      autoplay: true
    });
    lottieCharacterLoaded = true;
    anim.addEventListener('DOMLoaded', function () {
      var fallback = document.querySelector('.room-home .character-svg.character-fallback');
      if (fallback) fallback.classList.add('lottie-active');
    });
  }

  function showPhonePage(page) {
    document.getElementById('phone-page-stats').classList.toggle('active', page === 'stats');
    document.getElementById('phone-page-apps').classList.toggle('active', page === 'apps');
    document.querySelectorAll('.phone-nav-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-page') === page);
    });
  }

  var SEGMENT_IDS = {
    level: ['seg-level', 'seg-level-gym', 'seg-level-cave'],
    muscles: ['seg-muscles', 'seg-muscles-gym', 'seg-muscles-cave'],
    children: ['seg-children', 'seg-children-gym', 'seg-children-cave'],
    telegram: ['seg-telegram', 'seg-telegram-gym', 'seg-telegram-cave'],
    ton: ['seg-ton', 'seg-ton-gym', 'seg-ton-cave']
  };
  var NUM_IDS = {
    level: ['num-level', 'num-level-gym', 'num-level-cave'],
    muscles: ['num-muscles', 'num-muscles-gym', 'num-muscles-cave'],
    children: ['num-children', 'num-children-gym', 'num-children-cave'],
    telegram: ['num-telegram', 'num-telegram-gym', 'num-telegram-cave'],
    ton: ['num-ton', 'num-ton-gym', 'num-ton-cave']
  };

  function initSegmentBars() {
    document.querySelectorAll('.stat-segments').forEach(function (container) {
      if (container.children.length > 0) return;
      for (var i = 0; i < 10; i++) {
        var seg = document.createElement('div');
        seg.className = 'seg';
        container.appendChild(seg);
      }
    });
  }

  function setSegmentFilled(container, filledCount) {
    var kids = container.children;
    for (var i = 0; i < kids.length; i++) {
      kids[i].className = i < filledCount ? 'seg filled' : 'seg';
    }
  }

  function renderStatsPanels() {
    var stats = ['level', 'muscles', 'children', 'telegram', 'ton'];
    stats.forEach(function (key) {
      var val = state[key];
      var max = goals[key];
      var filled = Math.min(10, Math.round((val / max) * 10));
      SEGMENT_IDS[key].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) setSegmentFilled(el, filled);
      });
      NUM_IDS[key].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.textContent = val;
      });
    });
  }

  function renderPhoneStats() {
    var pct = function (val, max) { return Math.min(100, (val / max) * 100); };
    var barLevel = document.getElementById('p-bar-level');
    if (barLevel) barLevel.style.width = pct(state.level, goals.level) + '%';
    var pValLevel = document.getElementById('p-val-level');
    if (pValLevel) pValLevel.textContent = state.level;
    var pBarMuscles = document.getElementById('p-bar-muscles');
    if (pBarMuscles) pBarMuscles.style.width = pct(state.muscles, goals.muscles) + '%';
    var pValMuscles = document.getElementById('p-val-muscles');
    if (pValMuscles) pValMuscles.textContent = state.muscles;
    var pBarChildren = document.getElementById('p-bar-children');
    if (pBarChildren) pBarChildren.style.width = pct(state.children, goals.children) + '%';
    var pValChildren = document.getElementById('p-val-children');
    if (pValChildren) pValChildren.textContent = state.children;
    var pBarTelegram = document.getElementById('p-bar-telegram');
    if (pBarTelegram) pBarTelegram.style.width = pct(state.telegram, goals.telegram) + '%';
    var pValTelegram = document.getElementById('p-val-telegram');
    if (pValTelegram) pValTelegram.textContent = state.telegram;
    var pBarTon = document.getElementById('p-bar-ton');
    if (pBarTon) pBarTon.style.width = pct(state.ton, goals.ton) + '%';
    var pValTon = document.getElementById('p-val-ton');
    if (pValTon) pValTon.textContent = state.ton;
  }

  function updatePhoneTime() {
    var d = new Date();
    var t = d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    var el = document.getElementById('phone-time');
    if (el) el.textContent = t;
  }

  function init() {
    if (Telegram) {
      Telegram.ready();
      Telegram.expand();
      applyTheme();
    }
    load();
    initSegmentBars();
    showLocation(state.location);
    renderStatsPanels();
    renderPhoneStats();
    updatePhoneTime();
    setInterval(updatePhoneTime, 60000);
    if (window.lottie) loadLottieCharacter();

    document.querySelectorAll('.hotspot-area, .hotspot').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = this.getAttribute('data-action');
        if (action === 'open-phone') openPhone();
        else if (action === 'open-laptop') openLaptop();
        else if (action === 'go-map') showLocation('map');
        else if (action === 'view-muscles') doAction('view-muscles');
        else if (action && action !== 'open-phone') doAction(action, false);
      });
    });

    document.querySelectorAll('.map-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        showLocation(this.getAttribute('data-location'));
      });
    });

    document.getElementById('phone-close').addEventListener('click', closePhone);

    var laptopCloseEl = document.getElementById('laptop-close');
    if (laptopCloseEl) laptopCloseEl.addEventListener('click', closeLaptop);

    document.querySelectorAll('.laptop-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = this.getAttribute('data-action');
        if (action) doAction(action, false);
      });
    });

    document.querySelectorAll('.phone-nav-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        showPhonePage(this.getAttribute('data-page'));
      });
    });

    document.querySelectorAll('.phone-app').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = this.getAttribute('data-action');
        if (action === 'open-stats') showPhonePage('stats');
        else if (action) doAction(action, true);
      });
    });

    document.getElementById('btn-close-win').addEventListener('click', function () {
      document.getElementById('win-overlay').classList.add('hidden');
    });

    var btnSave = document.getElementById('btn-save');
    var btnReset = document.getElementById('btn-reset');
    if (btnSave) btnSave.addEventListener('click', save);
    if (btnReset) btnReset.addEventListener('click', function () {
      if (confirm('Сбросить весь прогресс?')) reset();
    });
  }

  function reset() {
    state = { level: 0, children: 0, muscles: 0, telegram: 0, ton: 0, location: 'home' };
    localStorage.removeItem(STORAGE_KEY);
    document.getElementById('win-overlay').classList.add('hidden');
    var log = document.getElementById('log');
    if (log) log.innerHTML = '<p>Ты в квартире молодого Павла. Подойди к телефону — там твоё состояние.</p>';
    showLocation('home');
    renderStatsPanels();
    renderPhoneStats();
    addLog('Прогресс сброшен.');
    if (Telegram) Telegram.HapticFeedback.notificationOccurred('warning');
  }

  window.durovReset = reset;
  window.durovSave = save;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
