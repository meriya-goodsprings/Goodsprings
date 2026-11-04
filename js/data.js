/**
 * GOODSPRINGS — Data Layer (Supabase)
 * Общие данные для всех устройств и посетителей
 */

let _sb = null;

function getSB() {
  if (_sb) return _sb;
  if (!GS_CONFIG.SUPABASE_URL || GS_CONFIG.SUPABASE_URL.includes('YOUR_PROJECT')) {
    console.error('Supabase не настроен. Открой js/config.js и вставь URL + anon key.');
    return null;
  }
  _sb = supabase.createClient(GS_CONFIG.SUPABASE_URL, GS_CONFIG.SUPABASE_ANON_KEY);
  return _sb;
}

function isConfigured() {
  return GS_CONFIG.SUPABASE_URL && !GS_CONFIG.SUPABASE_URL.includes('YOUR_PROJECT')
    && GS_CONFIG.SUPABASE_ANON_KEY && !GS_CONFIG.SUPABASE_ANON_KEY.includes('YOUR_ANON');
}

const GS = {
  isConfigured,

  async getSetting(key, fallback = null) {
    const sb = getSB();
    if (!sb) return fallback;
    const { data, error } = await sb.from('settings').select('value').eq('key', key).maybeSingle();
    if (error) { console.error(error); return fallback; }
    return data ? data.value : fallback;
  },

  async setSetting(key, value) {
    const sb = getSB();
    if (!sb) return;
    await sb.from('settings').upsert({ key, value, updated_at: new Date().toISOString() });
  },

  async getMeta() {
    return (await this.getSetting('meta')) || {
      name: 'Goodsprings', mayor: 'Рэй Дженкинс', status: 'Открыт', lastUpdate: '', population: '—'
    };
  },
  async setMeta(m) { await this.setSetting('meta', m); },

  async getMayorMsg() {
    const v = await this.getSetting('mayor_msg');
    return typeof v === 'string' ? v : (v || '');
  },
  async setMayorMsg(t) { await this.setSetting('mayor_msg', t); },

  async getAbout() {
    return (await this.getSetting('about')) || {};
  },
  async setAbout(a) { await this.setSetting('about', a); },

  async getAdminTeam() {
    const sb = getSB();
    if (!sb) return [];
    const { data } = await sb.from('admin_team').select('*').order('sort_order');
    return data || [];
  },

  async _list(table, orderCol = 'created_at', ascending = false) {
    const sb = getSB();
    if (!sb) return [];
    const { data, error } = await sb.from(table).select('*').order(orderCol, { ascending });
    if (error) { console.error(error); return []; }
    return data || [];
  },

  async _add(table, item) {
    const sb = getSB();
    if (!sb) return null;
    const { data, error } = await sb.from(table).insert(item).select().single();
    if (error) { console.error(error); alert('Ошибка сохранения: ' + error.message); return null; }
    await this._touch();
    return data;
  },

  async _remove(table, id) {
    const sb = getSB();
    if (!sb) return;
    await sb.from(table).delete().eq('id', id);
    await this._touch();
  },

  async _update(table, id, patch) {
    const sb = getSB();
    if (!sb) return;
    await sb.from(table).update(patch).eq('id', id);
  },

  async _touch() {
    const m = await this.getMeta();
    m.lastUpdate = new Date().toISOString().slice(0, 10);
    await this.setMeta(m);
  },

  getNews() { return this._list('news'); },
  addNews(item) {
    return this._add('news', {
      title: item.title,
      content: item.content,
      author: item.author || 'Администрация',
      date: item.date || new Date().toISOString().slice(0, 10)
    });
  },
  removeNews(id) { return this._remove('news', id); },

  getBoard() { return this._list('board'); },
  addBoard(item) {
    return this._add('board', {
      title: item.title,
      content: item.content,
      category: item.category || 'Разное',
      author: item.author || 'Житель',
      date: item.date || new Date().toISOString().slice(0, 10),
      status: item.status || 'published'
    });
  },
  removeBoard(id) { return this._remove('board', id); },

  getHousing() { return this._list('housing', 'created_at', true); },
  addHousing(item) {
    return this._add('housing', {
      title: item.title,
      description: item.description || '',
      condition: item.condition || '',
      price: item.price || '',
      status: item.status || 'free'
    });
  },
  removeHousing(id) { return this._remove('housing', id); },

  getJobs() { return this._list('jobs'); },
  addJob(item) {
    return this._add('jobs', {
      title: item.title,
      department: item.department || '',
      description: item.description || '',
      requirements: item.requirements || ''
    });
  },
  removeJob(id) { return this._remove('jobs', id); },

  getEvents() { return this._list('events'); },
  addEvent(item) {
    return this._add('events', {
      title: item.title,
      description: item.description || '',
      date: item.date || '',
      place: item.place || 'Гудспрингс',
      status: item.status || 'open'
    });
  },
  removeEvent(id) { return this._remove('events', id); },

  getProposals() { return this._list('proposals'); },
  addProposal(item) {
    return this._add('proposals', {
      title: item.title,
      content: item.content,
      author: item.author || 'Житель',
      status: 'pending',
      date: new Date().toISOString().slice(0, 10)
    });
  },
  updateProposal(id, status) { return this._update('proposals', id, { status }); },

  getMessages() { return this._list('messages'); },
  addMessage(item) {
    return this._add('messages', {
      author: item.author,
      topic: item.topic || 'Другое',
      content: item.content,
      status: 'new',
      date: new Date().toISOString().slice(0, 10)
    });
  },
  updateMessage(id, status) { return this._update('messages', id, { status }); },

  getSubmissions() { return this._list('submissions'); },
  addSubmission(item) {
    return this._add('submissions', {
      type: item.type || 'board',
      title: item.title,
      content: item.content,
      category: item.category || 'Разное',
      author: item.author || 'Аноним',
      status: 'pending'
    });
  },
  updateSubmission(id, status) { return this._update('submissions', id, { status }); },
  async approveSubmission(id) {
    const sb = getSB();
    if (!sb) return false;
    const { data: sub } = await sb.from('submissions').select('*').eq('id', id).single();
    if (!sub || sub.status !== 'pending') return false;
    if (sub.type === 'board') {
      await this.addBoard({
        title: sub.title,
        content: sub.content,
        category: sub.category,
        author: sub.author
      });
    }
    await this.updateSubmission(id, 'approved');
    return true;
  },

  checkAdmin(pass) {
    return pass === (GS_CONFIG.ADMIN_PASSWORD || 'goodsprings');
  },
  setAdminPass(p) {
    console.warn('Смена пароля: отредактируй ADMIN_PASSWORD в js/config.js и залей сайт заново');
  }
};
