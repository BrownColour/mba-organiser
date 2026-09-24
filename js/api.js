/* ============ API layer ============
   Talks to a Google Apps Script Web App deployed from Code.gs.
   Set your deployment URL below (Settings view also lets you set/change it at runtime,
   it's saved to localStorage under 'mba_api_url').
*/
const API = (() => {
  const LS_URL_KEY = 'mba_api_url';
  const LS_CACHE_KEY = 'mba_cache_v1';

  function getUrl(){
    return localStorage.getItem(LS_URL_KEY) || '';
  }
  function setUrl(url){
    localStorage.setItem(LS_URL_KEY, url.trim());
  }

  function loadCache(){
    try{
      return JSON.parse(localStorage.getItem(LS_CACHE_KEY)) || null;
    }catch(e){ return null; }
  }
  function saveCache(data){
    localStorage.setItem(LS_CACHE_KEY, JSON.stringify(data));
  }

  async function call(action, payload){
    const url = getUrl();
    if(!url){
      throw new Error('No Apps Script URL configured. Add it in Settings.');
    }
    const res = await fetch(url, {
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'}, // avoids CORS preflight on Apps Script
      body: JSON.stringify({ action, payload: payload || {} })
    });
    const json = await res.json();
    if(!json.ok) throw new Error(json.error || 'Request failed');
    return json.data;
  }

  async function getAll(){
    const data = await call('getAll');
    saveCache(data);
    return data;
  }

  return {
    getUrl, setUrl, loadCache, saveCache, call, getAll,
    addTrimester: (p)=>call('addTrimester', p),
    addCourse: (p)=>call('addCourse', p),
    updateCourse: (p)=>call('updateCourse', p),
    deleteCourse: (p)=>call('deleteCourse', p),
    addEvent: (p)=>call('addEvent', p),
    addEventsBulk: (p)=>call('addEventsBulk', p),
    updateEvent: (p)=>call('updateEvent', p),
    deleteEvent: (p)=>call('deleteEvent', p),
    setAttendance: (p)=>call('setAttendance', p),
  };
})();
