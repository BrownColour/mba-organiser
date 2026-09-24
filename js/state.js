/* ============ State ============ */
const STATE = {
  trimesters: [],
  courses: [],
  events: [],
  attendance: [],
  view: 'dashboard',
  calMode: 'week',        // day | week | month | trimester
  calDate: new Date(),    // anchor date for calendar navigation
  activeTrimesterId: null,
};

const TYPE_META = {
  session:        { label:'Session',        color:'var(--accent)', badge:'badge-accent' },
  test:           { label:'Test',           color:'var(--warning)', badge:'badge-warning' },
  submission:     { label:'Submission',     color:'var(--info)', badge:'badge-info' },
  assignment:     { label:'Assignment',     color:'var(--info)', badge:'badge-info' },
  presentation:   { label:'Presentation',   color:'#7ee0c7', badge:'badge-success' },
  flip:           { label:'Flip classroom', color:'#7ee0c7', badge:'badge-success' },
  case:           { label:'Case study',     color:'#7ee0c7', badge:'badge-success' },
  group_project:  { label:'Group project',  color:'var(--info)', badge:'badge-info' },
  exam:           { label:'Term-end exam',  color:'var(--danger)', badge:'badge-danger' },
  extracurricular:{ label:'Extra-curricular',color:'#f5a6d9', badge:'badge' },
  other:          { label:'Other',          color:'var(--text-dim)', badge:'badge' },
};

const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/* ---------- date helpers (local dates, ISO 'YYYY-MM-DD' strings for storage) ---------- */
function toISO(d){
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function fromISO(s){
  const [y,m,d] = s.split('-').map(Number);
  return new Date(y, m-1, d);
}
function addDays(d, n){ const r = new Date(d); r.setDate(r.getDate()+n); return r; }
function startOfWeek(d){ const r = new Date(d); const day = r.getDay(); return addDays(r, -day); } // Sunday start
function isSameDay(a,b){ return toISO(a)===toISO(b); }
function isToday(d){ return isSameDay(d, new Date()); }
function fmtDateLong(d){ return `${DOW[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`; }
function fmtDateShort(d){ return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)}`; }
function fmtTime(t){
  if(!t) return '';
  const [h,m] = t.split(':').map(Number);
  const ampm = h>=12 ? 'PM':'AM';
  const h12 = h%12===0 ? 12 : h%12;
  return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
}
function timeToMinutes(t){ const [h,m]=t.split(':').map(Number); return h*60+m; }
function minutesToTime(mins){
  mins = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(mins/60), m = mins%60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
function addMinutesToTime(t, add){ return minutesToTime(timeToMinutes(t)+add); }

/* ---------- lookups ---------- */
function courseById(id){ return STATE.courses.find(c=>c.id===id); }
function trimesterById(id){ return STATE.trimesters.find(t=>t.id===id); }
function activeTrimester(){ return trimesterById(STATE.activeTrimesterId) || STATE.trimesters[0]; }

function eventsInTrimester(trimesterId){
  return STATE.events.filter(e=>e.trimesterId===trimesterId);
}
function eventsOnDate(dateObj){
  const iso = toISO(dateObj);
  return STATE.events.filter(e=>e.date===iso).sort((a,b)=> (a.startTime||'').localeCompare(b.startTime||''));
}
function eventsInRange(startD, endD){ // inclusive
  const s = toISO(startD), e = toISO(endD);
  return STATE.events.filter(ev => ev.date >= s && ev.date <= e)
    .sort((a,b)=> a.date===b.date ? (a.startTime||'').localeCompare(b.startTime||'') : a.date.localeCompare(b.date));
}
function attendanceForEvent(eventId){ return STATE.attendance.find(a=>a.eventId===eventId); }
function attendanceForCourse(courseId){ return STATE.attendance.filter(a=>a.courseId===courseId); }

function courseSessionEvents(courseId){
  return STATE.events.filter(e=>e.courseId===courseId && e.type==='session')
    .sort((a,b)=> a.date===b.date ? (a.startTime||'').localeCompare(b.startTime||'') : a.date.localeCompare(b.date));
}

function colorForEvent(ev){
  const course = ev.courseId ? courseById(ev.courseId) : null;
  if(course && course.color) return course.color;
  return (TYPE_META[ev.type]||TYPE_META.other).color;
}
