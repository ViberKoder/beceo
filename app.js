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

  function showPhonePage(page) {
    document.getElementById('phone-page-stats').classList.toggle('active', page === 'stats');
    document.getElementById('phone-page-apps').classList.toggle('active', page === 'apps');
    document.querySelectorAll('.phone-nav-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-page') === page);
    });
  }

  function renderPhoneStats() {
    var pct = function (val, max) { return Math.min(100, (val / max) * 100); };
    document.getElementById('p-bar-level').style.width = pct(state.level, goals.level) + '%';
    document.getElementById('p-val-level').textContent = state.level;
    document.getElementById('p-bar-muscles').style.width = pct(state.muscles, goals.muscles) + '%';
    document.getElementById('p-val-muscles').textContent = state.muscles;
    document.getElementById('p-bar-children').style.width = pct(state.children, goals.children) + '%';
    document.getElementById('p-val-children').textContent = state.children;
    document.getElementById('p-bar-telegram').style.width = pct(state.telegram, goals.telegram) + '%';
    document.getElementById('p-val-telegram').textContent = state.telegram;
    document.getElementById('p-bar-ton').style.width = pct(state.ton, goals.ton) + '%';
    document.getElementById('p-val-ton').textContent = state.ton;
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
    showLocation(state.location);
    renderPhoneStats();
    updatePhoneTime();
    setInterval(updatePhoneTime, 60000);

    document.querySelectorAll('.hotspot-area, .hotspot').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = this.getAttribute('data-action');
        if (action === 'open-phone') openPhone();
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
