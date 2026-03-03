import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as a}from"./index.DiEladB3.js";const R=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];function G({adminKey:l}){const[x,$]=a.useState([]),[p,w]=a.useState([]),[T,E]=a.useState([]),[d,N]=a.useState([]),[C,D]=a.useState(!0),[u,j]=a.useState(!1),[h,g]=a.useState("class"),[c,A]=a.useState(""),[b,P]=a.useState("Monday"),[O,k]=a.useState(null),z=a.useCallback(async(t=!1)=>{t||D(!0);try{const[v,y,o,_]=await Promise.all([fetch("/api/timetable"),fetch("/api/classes"),fetch("/api/teachers"),fetch("/api/templates")]),[B,L,U,W]=await Promise.all([v.json(),y.json(),o.json(),_.json()]);$(Array.isArray(B)?B:[]),w(Array.isArray(L)?L:[]),E(Array.isArray(U)?U:[]),N(Array.isArray(W)?W:[]),Array.isArray(L)&&L.length>0&&!c&&A(L[0].id)}catch(v){console.error("Failed to load data",v)}t||D(!1)},[c]);a.useEffect(()=>{z()},[z]);const i=async(t,v,y,o)=>{j(!0);try{if(o===null){if(!(await fetch(`/api/timetable?class_id=${t}&day=${v}&slot_index=${y}`,{method:"DELETE",headers:{Authorization:`Bearer ${l}`}})).ok)throw new Error("Delete failed")}else if(!(await fetch("/api/timetable",{method:"PATCH",headers:{Authorization:`Bearer ${l}`,"Content-Type":"application/json"},body:JSON.stringify({class_id:t,day:v,slot_index:y,teacher_id:o})})).ok)throw new Error("Update failed");await z(!0)}catch(_){alert(_.message)}finally{j(!1)}},n={};for(const t of x)n[`${t.day}_${t.slot_index}_${t.class_id}`]=t;const r=new Set,s={};for(const t of x){const v=`${t.day}_${t.slot_index}_${t.teacher_id}`;s[v]||(s[v]=[]),s[v].push(t.class_id)}for(const t in s)s[t].length>1&&s[t].forEach(v=>{const y=t.split("_");r.add(`${y[0]}_${y[1]}_${v}`)});const f=t=>{k(t)},m=(t,v,y)=>{if(!O)return;const o=x.find(_=>_.teacher_id===O.id&&_.day===v&&_.slot_index===y&&_.class_id!==t);if(o){const _=p.find(L=>L.id===o.class_id);if(!window.confirm(`⚠️ Scheduling Conflict!

${O.name} is already assigned to "${_?.name||"another class"}" on ${v} during Period ${y+1}.

Assigning them here will create a double-booking.

Do you want to proceed anyway?`)){k(null);return}}i(t,v,y,O.id),k(null)},I=()=>{const t=p.find(o=>o.id===c),y=d.find(o=>o.id===t?.template_id)?.slots||[];return t?y.length===0?e.jsx("div",{className:"empty-state",children:"No slots defined for this class template"}):e.jsx("div",{className:"timetable-wrapper",children:e.jsxs("table",{className:"timetable editable",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Day / Period"}),y.map((o,_)=>e.jsxs("th",{children:[e.jsx("div",{children:o.label}),e.jsxs("div",{style:{fontSize:"0.7rem",opacity:.7},children:[o.start_time,"-",o.end_time]})]},_))]})}),e.jsx("tbody",{children:R.map(o=>e.jsxs("tr",{children:[e.jsx("th",{children:o}),y.map((_,B)=>{const L=n[`${o}_${B}_${c}`],U=r.has(`${o}_${B}_${c}`);return e.jsx("td",{className:`slot-cell ${U?"conflict":""}`,onDragOver:W=>W.preventDefault(),onDrop:()=>m(c,o,B),children:c&&e.jsx(e.Fragment,{children:L?e.jsxs("div",{className:"assignment-box",children:[e.jsx("div",{className:"teacher-name",children:L.teachers?.name||"—"}),e.jsx("div",{className:"teacher-subject",children:L.teachers?.subject}),e.jsx("button",{className:"remove-btn",onClick:()=>i(c,o,B,null),title:"Remove assignment",children:"×"})]}):e.jsx("div",{className:"empty-slot",children:"Drop here"})})},B)})]},o))})]})}):e.jsx("div",{className:"empty-state",children:"Select a class"})},J=Math.max(...d.map(t=>t.slots?.length||0),0),M=Array.from({length:J},(t,v)=>v),H=()=>e.jsx("div",{className:"timetable-wrapper",children:e.jsxs("table",{className:"timetable editable",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Class"}),M.map(t=>{const y=d.find(o=>o.slots&&o.slots[t])?.slots?.[t];return e.jsxs("th",{children:[e.jsx("div",{children:y?.label||`P${t+1}`}),y&&e.jsxs("div",{style:{fontSize:"0.7rem",opacity:.7},children:[y.start_time,"-",y.end_time]})]},t)})]})}),e.jsx("tbody",{children:p.map(t=>{const y=d.find(o=>o.id===t.template_id)?.slots||[];return e.jsxs("tr",{children:[e.jsx("th",{children:t.name}),M.map(o=>{if(o>=y.length)return e.jsx("td",{className:"locked-cell",children:"—"},o);const _=n[`${b}_${o}_${t.id}`],B=r.has(`${b}_${o}_${t.id}`);return e.jsx("td",{className:`slot-cell ${B?"conflict":""}`,onDragOver:L=>L.preventDefault(),onDrop:()=>m(t.id,b,o),children:_?e.jsxs("div",{className:"assignment-box",children:[e.jsx("div",{className:"teacher-name",children:_.teachers?.name||"—"}),e.jsx("div",{className:"teacher-subject",children:_.teachers?.subject}),e.jsx("button",{className:"remove-btn",onClick:()=>i(t.id,b,o,null),children:"×"})]}):e.jsx("div",{className:"empty-slot",children:"+"})},o)})]},t.id)})})]})});return C?e.jsxs("div",{className:"loading-overlay",children:[e.jsx("span",{className:"spinner"})," Loading Editor..."]}):e.jsxs("div",{className:"editor-container fade-in",children:[e.jsxs("div",{className:"editor-layout",children:[e.jsxs("div",{className:"editor-sidebar",children:[e.jsx("h3",{className:"section-title",children:"👨‍🏫 Teachers"}),e.jsx("p",{className:"hint text-muted",children:"Drag a teacher to an empty slot"}),e.jsx("div",{className:"teacher-drag-list",children:T.map(t=>e.jsxs("div",{className:"draggable-teacher card",draggable:!0,onDragStart:()=>f(t),children:[e.jsx("div",{className:"teacher-name",children:t.name}),e.jsx("div",{className:"teacher-subject",children:t.subject})]},t.id))})]}),e.jsxs("div",{className:"editor-main",children:[e.jsxs("div",{className:"editor-header nav-row",children:[e.jsxs("div",{className:"view-toggle",children:[e.jsx("button",{className:`ed-toggle-btn ${h==="class"?"active":""}`,onClick:()=>g("class"),children:"📅 Day View"}),e.jsx("button",{className:`ed-toggle-btn ${h==="day"?"active":""}`,onClick:()=>g("day"),children:"🏫 Class View"})]}),h==="class"?e.jsxs("div",{className:"filter-item",children:[e.jsx("label",{children:"Select Class:"}),e.jsx("select",{className:"form-select",value:c,onChange:t=>A(t.target.value),style:{minWidth:"150px"},children:p.map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))})]}):e.jsxs("div",{className:"filter-item",children:[e.jsx("label",{children:"Select Day:"}),e.jsx("select",{className:"form-select",value:b,onChange:t=>P(t.target.value),style:{minWidth:"150px"},children:R.map(t=>e.jsx("option",{value:t,children:t},t))})]}),u&&e.jsxs("span",{className:"saving-indicator",children:[e.jsx("span",{className:"spinner"})," Saving..."]})]}),h==="class"?I():H()]})]}),e.jsx("style",{children:`
                .editor-layout {
                    display: grid;
                    grid-template-columns: 220px 1fr;
                    gap: 1rem;
                    min-height: 400px;
                }
                .editor-sidebar {
                    background: var(--bg-secondary);
                    padding: 1rem;
                    border-radius: var(--radius-lg);
                    border: 0.5px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: var(--shadow);
                }
                .teacher-drag-list {
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    padding: 0.25rem 0;
                    -webkit-overflow-scrolling: touch;
                }
                .draggable-teacher {
                    cursor: grab;
                    padding: 0.75rem !important;
                    margin: 0 !important;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    user-select: none;
                    background: var(--bg-primary);
                    border: 0.5px solid var(--border);
                    border-radius: var(--radius-sm) !important;
                }
                .draggable-teacher:hover {
                    border-color: var(--accent-primary);
                    background: var(--bg-card-hover);
                    box-shadow: var(--shadow);
                }
                .draggable-teacher:active {
                    cursor: grabbing;
                    transform: scale(0.97);
                }
                .draggable-teacher .teacher-name {
                    font-weight: 600;
                    font-size: 0.85rem;
                    color: var(--text-primary);
                }
                .draggable-teacher .teacher-subject {
                    font-size: 0.72rem;
                    color: var(--text-secondary);
                    margin-top: 1px;
                }
                .editor-main {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    min-width: 0;
                }
                .editor-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: var(--bg-secondary);
                    padding: 0.6rem 0.85rem;
                    border-radius: var(--radius);
                    border: 0.5px solid var(--border);
                    flex-wrap: wrap;
                    box-shadow: var(--shadow);
                }
                .nav-row {
                    display: flex;
                    justify-content: flex-start;
                }
                .view-toggle {
                    display: inline-flex;
                    background: var(--bg-tertiary);
                    border: 0.5px solid var(--border);
                    padding: 3px;
                    border-radius: 10px;
                    gap: 2px;
                }
                .ed-toggle-btn {
                    padding: 0.4rem 0.85rem;
                    border: none;
                    background: transparent;
                    font-family: inherit;
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: var(--text-secondary);
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.25s ease;
                    white-space: nowrap;
                }
                .ed-toggle-btn:hover {
                    color: var(--text-primary);
                }
                .ed-toggle-btn.active {
                    background: var(--accent-primary);
                    color: #fff;
                    box-shadow: 0 2px 6px var(--accent-glow);
                }
                .filter-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                }
                .filter-item label {
                    white-space: nowrap;
                    font-weight: 500;
                    color: var(--text-secondary);
                    font-size: 0.82rem;
                }
                .filter-item select {
                    min-width: 130px;
                    font-size: 16px;
                }
                .slot-cell {
                    min-height: 60px;
                    transition: all 0.2s;
                    position: relative;
                    vertical-align: middle;
                }
                .slot-cell:hover {
                    background: var(--accent-glow);
                }
                .empty-slot {
                    color: var(--text-muted);
                    font-size: 0.75rem;
                    border: 1px dashed var(--border);
                    border-radius: var(--radius-sm);
                    padding: 0.6rem;
                    text-align: center;
                    transition: all 0.2s;
                }
                .slot-cell:hover .empty-slot {
                    border-color: var(--accent-primary);
                    color: var(--accent-primary);
                }
                .assignment-box {
                    background: var(--accent-primary);
                    color: white;
                    padding: 0.5rem;
                    border-radius: var(--radius-sm);
                    font-size: 0.8rem;
                    position: relative;
                    animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    box-shadow: 0 2px 6px rgba(0, 122, 255, 0.3);
                }
                .assignment-box .teacher-name {
                    color: white !important;
                    font-size: 0.8rem;
                }
                .assignment-box .teacher-subject {
                    color: rgba(255,255,255,0.8) !important;
                    font-size: 0.68rem;
                }
                @keyframes popIn {
                    from { transform: scale(0.5); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .remove-btn {
                    position: absolute;
                    top: -6px;
                    right: -6px;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: var(--danger);
                    color: white;
                    border: 2px solid var(--bg-secondary);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 12px;
                    opacity: 0;
                    transform: scale(0.8);
                    transition: all 0.2s;
                    box-shadow: var(--shadow);
                }
                .assignment-box:hover .remove-btn {
                    opacity: 1;
                    transform: scale(1);
                }
                .conflict {
                    background: var(--danger-bg) !important;
                    border: 1px solid var(--danger) !important;
                }
                .conflict::after {
                    content: '⚠️';
                    position: absolute;
                    bottom: 2px;
                    right: 4px;
                    font-size: 0.6rem;
                }
                .locked-cell {
                    background: var(--bg-primary) !important;
                    opacity: 0.35;
                    cursor: not-allowed;
                }
                .saving-indicator {
                    margin-left: auto;
                    font-size: 0.82rem;
                    color: var(--accent-primary);
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                /* ── Mobile breakpoints ── */
                @media (max-width: 768px) {
                    .editor-layout {
                        grid-template-columns: 1fr;
                        gap: 0.75rem;
                    }
                    .editor-sidebar {
                        max-height: none;
                        order: -1;
                    }
                    .editor-sidebar .section-title {
                        font-size: 0.95rem;
                    }
                    .teacher-drag-list {
                        flex-direction: row;
                        overflow-x: auto;
                        overflow-y: hidden;
                        gap: 0.5rem;
                        padding: 0.25rem 0;
                        scrollbar-width: none;
                    }
                    .teacher-drag-list::-webkit-scrollbar {
                        display: none;
                    }
                    .draggable-teacher {
                        min-width: 130px;
                        flex-shrink: 0;
                        padding: 0.6rem !important;
                    }
                    .draggable-teacher .teacher-name {
                        font-size: 0.8rem;
                    }
                    .draggable-teacher .teacher-subject {
                        font-size: 0.68rem;
                    }
                    .editor-header {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 0.5rem;
                    }
                    .view-toggle {
                        width: 100%;
                    }
                    .ed-toggle-btn {
                        flex: 1;
                        text-align: center;
                    }
                    .filter-item {
                        width: 100%;
                    }
                    .filter-item select {
                        flex: 1;
                    }
                }

                @media (max-width: 640px) {
                    .remove-btn {
                        opacity: 1;
                        transform: scale(1);
                        width: 18px;
                        height: 18px;
                        font-size: 11px;
                        top: -5px;
                        right: -5px;
                    }
                    .slot-cell {
                        min-height: 50px;
                    }
                    .empty-slot {
                        padding: 0.4rem;
                        font-size: 0.7rem;
                    }
                    .assignment-box {
                        padding: 0.4rem;
                    }
                    .assignment-box .teacher-name {
                        font-size: 0.72rem !important;
                    }
                    .assignment-box .teacher-subject {
                        font-size: 0.62rem !important;
                    }
                }
            `})]})}function F({message:l,type:x,onClose:$}){return a.useEffect(()=>{const p=setTimeout($,3e3);return()=>clearTimeout(p)},[$]),e.jsxs("div",{className:`toast toast-${x}`,children:[x==="success"?"✓":"✕"," ",l]})}function Y(l){return{"Content-Type":"application/json",Authorization:`Bearer ${l}`}}async function S(l,x,$){const p=await fetch(l,{...$,headers:{...Y(x),...$?.headers||{}}}),w=await p.json();if(!p.ok)throw new Error(w.error||"Request failed");return w}function V({adminKey:l}){const[x,$]=a.useState([]),[p,w]=a.useState(!0),[T,E]=a.useState(""),[d,N]=a.useState([{label:"Period 1",start_time:"08:00",end_time:"08:45"}]),[C,D]=a.useState(!1),[u,j]=a.useState(null),[h,g]=a.useState(null),c=a.useCallback(async(n=!1)=>{n||w(!0);try{const r=await S("/api/templates",l);$(r)}catch{}n||w(!1)},[l]);a.useEffect(()=>{c()},[c]);const A=()=>{const n=d.length+1;N([...d,{label:`Period ${n}`,start_time:"",end_time:""}])},b=n=>N(d.filter((r,s)=>s!==n)),P=(n,r,s)=>{const f=[...d];f[n]={...f[n],[r]:s},N(f)},O=async()=>{if(T.trim()){D(!0);try{h?(await S("/api/templates",l,{method:"PUT",body:JSON.stringify({id:h,name:T,slots:d})}),j({msg:`Template "${T}" updated!`,type:"success"})):(await S("/api/templates",l,{method:"POST",body:JSON.stringify({name:T,slots:d})}),j({msg:`Template "${T}" created!`,type:"success"})),z(),c(!0)}catch(n){j({msg:n.message,type:"error"})}D(!1)}},k=n=>{g(n.id),E(n.name),N(n.slots||[{label:"Period 1",start_time:"08:00",end_time:"08:45"}]),window.scrollTo({top:0,behavior:"smooth"})},z=()=>{g(null),E(""),N([{label:"Period 1",start_time:"08:00",end_time:"08:45"}])},i=async(n,r)=>{if(confirm(`Delete template "${r}"?`))try{await S(`/api/templates?id=${n}`,l,{method:"DELETE"}),j({msg:"Template deleted",type:"success"}),h===n&&z(),c(!0)}catch(s){j({msg:s.message,type:"error"})}};return e.jsxs("div",{className:"fade-in",children:[u&&e.jsx(F,{message:u.msg,type:u.type,onClose:()=>j(null)}),e.jsxs("div",{className:`card ${h?"editing-pulse":""}`,style:{marginBottom:"1.5rem"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("span",{className:"card-title",children:h?"✏️ Edit Time Slot Template":"➕ Create Time Slot Template"}),h&&e.jsx("button",{className:"btn btn-ghost btn-sm",onClick:z,children:"Cancel"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Template Name"}),e.jsx("input",{className:"form-input",placeholder:"e.g. Morning Session, Afternoon Session",value:T,onChange:n=>E(n.target.value)})]}),e.jsx("label",{className:"form-label",children:"Lecture Periods"}),e.jsx("div",{className:"slot-list",children:d.map((n,r)=>e.jsxs("div",{className:"slot-item",children:[e.jsx("input",{className:"form-input",style:{maxWidth:120},placeholder:"Label",value:n.label,onChange:s=>P(r,"label",s.target.value)}),e.jsx("input",{className:"form-input",type:"time",style:{maxWidth:130},value:n.start_time,onChange:s=>P(r,"start_time",s.target.value)}),e.jsx("span",{style:{color:"var(--text-muted)"},children:"→"}),e.jsx("input",{className:"form-input",type:"time",style:{maxWidth:130},value:n.end_time,onChange:s=>P(r,"end_time",s.target.value)}),d.length>1&&e.jsx("button",{className:"btn btn-danger btn-sm",onClick:()=>b(r),children:"✕"})]},r))}),e.jsxs("div",{style:{display:"flex",gap:"0.75rem",marginTop:"1rem"},children:[e.jsx("button",{className:"btn btn-ghost btn-sm",onClick:A,children:"+ Add Period"}),e.jsx("button",{className:"btn btn-primary",onClick:O,disabled:C||!T.trim(),children:C?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"spinner"})," Saving..."]}):h?"💾 Update Template":"💾 Save Template"})]})]}),e.jsx("h3",{className:"section-title",children:"📋 Existing Templates"}),p?e.jsxs("div",{className:"loading-overlay",children:[e.jsx("span",{className:"spinner"})," Loading templates..."]}):x.length===0?e.jsxs("div",{className:"empty-state",children:[e.jsx("div",{className:"icon",children:"🕐"}),e.jsx("p",{children:"No templates yet. Create one above!"})]}):e.jsx("div",{className:"card-grid",children:x.map(n=>e.jsxs("div",{className:`card ${h===n.id?"active-border":""}`,children:[e.jsxs("div",{className:"card-header",children:[e.jsx("span",{className:"card-title",children:n.name}),e.jsxs("div",{style:{display:"flex",gap:"0.4rem"},children:[e.jsx("button",{className:"btn btn-ghost btn-sm",onClick:()=>k(n),children:"Edit"}),e.jsx("button",{className:"btn btn-danger btn-sm",onClick:()=>i(n.id,n.name),children:"Delete"})]})]}),e.jsxs("span",{className:"badge badge-purple",children:[n.slots?.length||0," periods"]}),n.slots&&n.slots.length>0&&e.jsx("div",{className:"slot-list",children:n.slots.map((r,s)=>e.jsxs("div",{className:"slot-item",children:[e.jsx("span",{className:"slot-label",children:r.label}),e.jsxs("span",{className:"slot-time",children:[r.start_time," → ",r.end_time]})]},s))})]},n.id))})]})}function q({adminKey:l}){const[x,$]=a.useState([]),[p,w]=a.useState([]),[T,E]=a.useState(!0),[d,N]=a.useState(""),[C,D]=a.useState(""),[u,j]=a.useState(!1),[h,g]=a.useState(null),[c,A]=a.useState(null),b=a.useCallback(async(i=!1)=>{i||E(!0);try{const[n,r]=await Promise.all([S("/api/classes",l),S("/api/templates",l)]);$(n),w(r)}catch{}i||E(!1)},[l]);a.useEffect(()=>{b()},[b]);const P=async()=>{if(!(!d.trim()||!C)){j(!0);try{c?(await S("/api/classes",l,{method:"PUT",body:JSON.stringify({id:c,name:d,template_id:C})}),g({msg:`Class "${d}" updated!`,type:"success"})):(await S("/api/classes",l,{method:"POST",body:JSON.stringify({name:d,template_id:C})}),g({msg:`Class "${d}" added!`,type:"success"})),k(),b(!0)}catch(i){g({msg:i.message,type:"error"})}j(!1)}},O=i=>{A(i.id),N(i.name),D(i.template_id||""),window.scrollTo({top:0,behavior:"smooth"})},k=()=>{A(null),N(""),D("")},z=async(i,n)=>{if(confirm(`Delete class "${n}"?`))try{await S(`/api/classes?id=${i}`,l,{method:"DELETE"}),g({msg:"Class deleted",type:"success"}),c===i&&k(),b(!0)}catch(r){g({msg:r.message,type:"error"})}};return e.jsxs("div",{className:"fade-in",children:[h&&e.jsx(F,{message:h.msg,type:h.type,onClose:()=>g(null)}),e.jsxs("div",{className:`card ${c?"editing-pulse":""}`,style:{marginBottom:"1.5rem"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("span",{className:"card-title",children:c?"✏️ Edit Class":"➕ Add Class"}),c&&e.jsx("button",{className:"btn btn-ghost btn-sm",onClick:k,children:"Cancel"})]}),e.jsxs("div",{className:"form-inline",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Class Name"}),e.jsx("input",{className:"form-input",placeholder:"e.g. 1st Std, 4th Std",value:d,onChange:i=>N(i.target.value)})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Time Slot Template"}),e.jsxs("select",{className:"form-select",value:C,onChange:i=>D(i.target.value),children:[e.jsx("option",{value:"",children:"Select template..."}),p.map(i=>e.jsx("option",{value:i.id,children:i.name},i.id))]})]}),e.jsx("button",{className:"btn btn-primary",onClick:P,disabled:u||!d.trim()||!C,children:u?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"spinner"})," Saving..."]}):c?"💾 Update":"➕ Add"})]})]}),e.jsx("h3",{className:"section-title",children:"🏫 Classes"}),T?e.jsxs("div",{className:"loading-overlay",children:[e.jsx("span",{className:"spinner"})," Loading..."]}):x.length===0?e.jsxs("div",{className:"empty-state",children:[e.jsx("div",{className:"icon",children:"🏫"}),e.jsx("p",{children:"No classes added yet."})]}):e.jsx("div",{className:"card-grid",children:x.map(i=>e.jsxs("div",{className:`card ${c===i.id?"active-border":""}`,children:[e.jsxs("div",{className:"card-header",children:[e.jsx("span",{className:"card-title",children:i.name}),e.jsxs("div",{style:{display:"flex",gap:"0.4rem"},children:[e.jsx("button",{className:"btn btn-ghost btn-sm",onClick:()=>O(i),children:"Edit"}),e.jsx("button",{className:"btn btn-danger btn-sm",onClick:()=>z(i.id,i.name),children:"Delete"})]})]}),i.time_slot_templates&&e.jsxs("span",{className:"badge badge-purple",children:["📅 ",i.time_slot_templates.name]})]},i.id))})]})}function Q({adminKey:l}){const[x,$]=a.useState([]),[p,w]=a.useState([]),[T,E]=a.useState(!0),[d,N]=a.useState(""),[C,D]=a.useState(""),[u,j]=a.useState(!1),[h,g]=a.useState(null),[c,A]=a.useState(null),b=a.useCallback(async(s=!1)=>{s||E(!0);try{const[f,m]=await Promise.all([S("/api/teachers",l),S("/api/templates",l)]);$(f),w(m)}catch{}s||E(!1)},[l]);a.useEffect(()=>{b()},[b]);const P=async()=>{if(d.trim()){j(!0);try{c?(await S("/api/teachers",l,{method:"PUT",body:JSON.stringify({id:c,name:d,subject:C})}),g({msg:`Teacher "${d}" updated!`,type:"success"})):(await S("/api/teachers",l,{method:"POST",body:JSON.stringify({name:d,subject:C})}),g({msg:`Teacher "${d}" added!`,type:"success"})),k(),b(!0)}catch(s){g({msg:s.message,type:"error"})}j(!1)}},O=s=>{A(s.id),N(s.name),D(s.subject),window.scrollTo({top:0,behavior:"smooth"})},k=()=>{A(null),N(""),D("")},z=async(s,f)=>{if(confirm(`Delete teacher "${f}"?`))try{await S(`/api/teachers?id=${s}`,l,{method:"DELETE"}),g({msg:"Teacher removed",type:"success"}),c===s&&k(),b(!0)}catch(m){g({msg:m.message,type:"error"})}},i=async(s,f)=>{try{await S("/api/teacher-assignments",l,{method:"POST",body:JSON.stringify({teacher_id:s,template_id:f})}),g({msg:"Teacher assigned to template!",type:"success"}),b(!0)}catch(m){g({msg:m.message,type:"error"})}},n=async(s,f)=>{try{await S(`/api/teacher-assignments?teacher_id=${s}&template_id=${f}`,l,{method:"DELETE"}),g({msg:"Assignment removed",type:"success"}),b(!0)}catch(m){g({msg:m.message,type:"error"})}},r=s=>{const f=new Set;return(s.teacher_slot_assignments||[]).forEach(m=>f.add(m.template_id)),f};return e.jsxs("div",{className:"fade-in",children:[h&&e.jsx(F,{message:h.msg,type:h.type,onClose:()=>g(null)}),e.jsxs("div",{className:`card ${c?"editing-pulse":""}`,style:{marginBottom:"1.5rem"},children:[e.jsxs("div",{className:"card-header",children:[e.jsx("span",{className:"card-title",children:c?"✏️ Edit Teacher":"➕ Add Teacher"}),c&&e.jsx("button",{className:"btn btn-ghost btn-sm",onClick:k,children:"Cancel"})]}),e.jsxs("div",{className:"form-inline",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Name"}),e.jsx("input",{className:"form-input",placeholder:"Teacher name",value:d,onChange:s=>N(s.target.value)})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{className:"form-label",children:"Subject"}),e.jsx("input",{className:"form-input",placeholder:"e.g. Math, English",value:C,onChange:s=>D(s.target.value)})]}),e.jsx("button",{className:"btn btn-primary",onClick:P,disabled:u||!d.trim(),children:u?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"spinner"})," Saving..."]}):c?"💾 Update":"➕ Add"})]})]}),e.jsx("h3",{className:"section-title",children:"👩‍🏫 Teachers"}),T?e.jsxs("div",{className:"loading-overlay",children:[e.jsx("span",{className:"spinner"})," Loading..."]}):x.length===0?e.jsxs("div",{className:"empty-state",children:[e.jsx("div",{className:"icon",children:"👩‍🏫"}),e.jsx("p",{children:"No teachers added yet."})]}):e.jsx("div",{className:"card-grid",children:x.map(s=>{const f=r(s);return e.jsxs("div",{className:`card ${c===s.id?"active-border":""}`,children:[e.jsxs("div",{className:"card-header",children:[e.jsx("span",{className:"card-title",children:s.name}),e.jsxs("div",{style:{display:"flex",gap:"0.4rem"},children:[e.jsx("button",{className:"btn btn-ghost btn-sm",onClick:()=>O(s),children:"Edit"}),e.jsx("button",{className:"btn btn-danger btn-sm",onClick:()=>z(s.id,s.name),children:"Delete"})]})]}),s.subject&&e.jsxs("span",{className:"badge badge-yellow",style:{marginBottom:"0.75rem"},children:["📚 ",s.subject]}),e.jsx("label",{className:"form-label",style:{marginTop:"0.5rem"},children:"Assigned Templates"}),e.jsxs("div",{className:"assign-row",children:[p.map(m=>{const I=f.has(m.id);return e.jsxs("label",{className:"toggle-row",title:I?"Click to unassign":"Click to assign",children:[e.jsx("input",{type:"checkbox",checked:I,onChange:()=>I?n(s.id,m.id):i(s.id,m.id)}),m.name]},m.id)}),p.length===0&&e.jsx("span",{style:{color:"var(--text-muted)",fontSize:"0.8rem"},children:"Create templates first"})]})]},s.id)})})]})}function X({adminKey:l}){const[x,$]=a.useState(!1),[p,w]=a.useState(null),[T,E]=a.useState(null),[d,N]=a.useState([]),[C,D]=a.useState([]),[u,j]=a.useState([]),[h,g]=a.useState(new Set),[c,A]=a.useState(new Set),[b,P]=a.useState(new Set),O=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],[k,z]=a.useState(new Set(["Monday","Tuesday","Wednesday","Thursday","Friday"]));a.useEffect(()=>{Promise.all([S("/api/classes",l),S("/api/teachers",l),S("/api/templates",l)]).then(([r,s,f])=>{N(r),D(s),j(f),g(new Set(r.map(m=>m.id))),A(new Set(s.map(m=>m.id))),P(new Set(f.map(m=>m.id)))}).catch(()=>{})},[l]);const i=(r,s,f)=>{const m=new Set(r);m.has(s)?m.delete(s):m.add(s),f(m)},n=async()=>{if(confirm("This will overwrite timetables for the selected targets. Continue?")){$(!0),w(null);try{const r=await S("/api/generate",l,{method:"POST",body:JSON.stringify({class_ids:Array.from(h),template_ids:Array.from(b),teacher_ids:Array.from(c),days:Array.from(k)})});w(r),E({msg:r.message,type:"success"})}catch(r){w({success:!1,message:r.message}),E({msg:r.message,type:"error"})}$(!1)}};return e.jsxs("div",{className:"fade-in",children:[T&&e.jsx(F,{message:T.msg,type:T.type,onClose:()=>E(null)}),e.jsxs("div",{className:"card",style:{padding:"1.25rem"},children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:"1.5rem"},children:[e.jsx("div",{style:{fontSize:"2.5rem",marginBottom:"0.4rem"},children:"🪄"}),e.jsx("h2",{style:{fontSize:"1.2rem",fontWeight:700},children:"Selective Auto-Generation"}),e.jsx("p",{style:{color:"var(--text-secondary)",fontSize:"0.85rem",lineHeight:1.4,marginTop:"0.3rem"},children:"Choose targets carefully. Unselected items will be excluded."})]}),e.jsxs("div",{className:"form-row",style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))",gap:"1rem",marginBottom:"1.5rem"},children:[e.jsxs("div",{className:"form-group",children:[e.jsxs("h4",{style:{marginBottom:"0.5rem",color:"var(--accent-secondary)"},children:["🗓️ Days (",k.size,")"]}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"0.4rem",maxHeight:"150px",overflowY:"auto"},children:O.map(r=>e.jsxs("label",{className:"toggle-row",children:[e.jsx("input",{type:"checkbox",checked:k.has(r),onChange:()=>i(k,r,z)})," ",r]},r))})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("h4",{style:{marginBottom:"0.5rem",color:"var(--accent-secondary)"},children:["🕒 Templates (",b.size,")"]}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"0.4rem",maxHeight:"150px",overflowY:"auto"},children:u.map(r=>e.jsxs("label",{className:"toggle-row",children:[e.jsx("input",{type:"checkbox",checked:b.has(r.id),onChange:()=>i(b,r.id,P)})," ",r.name]},r.id))})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("h4",{style:{marginBottom:"0.5rem",color:"var(--accent-secondary)"},children:["🏫 Classes (",h.size,")"]}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"0.4rem",maxHeight:"150px",overflowY:"auto"},children:d.map(r=>e.jsxs("label",{className:"toggle-row",children:[e.jsx("input",{type:"checkbox",checked:h.has(r.id),onChange:()=>i(h,r.id,g)})," ",r.name]},r.id))})]}),e.jsxs("div",{className:"form-group",children:[e.jsxs("h4",{style:{marginBottom:"0.5rem",color:"var(--accent-secondary)"},children:["👩‍🏫 Teachers (",c.size,")"]}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"0.4rem",maxHeight:"150px",overflowY:"auto"},children:C.map(r=>e.jsxs("label",{className:"toggle-row",children:[e.jsx("input",{type:"checkbox",checked:c.has(r.id),onChange:()=>i(c,r.id,A)})," ",r.name]},r.id))})]})]}),e.jsx("div",{style:{textAlign:"center"},children:e.jsx("button",{className:"btn btn-success btn-lg",onClick:n,disabled:x||h.size===0||k.size===0,children:x?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"spinner"})," Generating..."]}):"⚡ Run Smart Algorithm"})}),p&&e.jsxs("div",{style:{marginTop:"1.5rem",padding:"1rem",borderRadius:"var(--radius-sm)",background:p.success?"var(--success-bg)":"var(--danger-bg)",color:p.success?"var(--success)":"var(--danger)",fontSize:"0.9rem",textAlign:"center"},children:[p.success?"✓":"✕"," ",p.message]})]})]})}function ee(){const[l,x]=a.useState(""),[$,p]=a.useState(!1),[w,T]=a.useState(""),[E,d]=a.useState(0);a.useEffect(()=>{const u=localStorage.getItem("adminSecretKey");u&&(x(u),p(!0))},[]);const N=[{label:"🗓️ Editor",component:e.jsx(G,{adminKey:l})},{label:"🕐 Time Slots",component:e.jsx(V,{adminKey:l})},{label:"🏫 Classes",component:e.jsx(q,{adminKey:l})},{label:"👩‍🏫 Teachers",component:e.jsx(Q,{adminKey:l})},{label:"⚡ Generate",component:e.jsx(X,{adminKey:l})}],C=()=>{if(w.trim()){const u=w.trim();x(u),p(!0),localStorage.setItem("adminSecretKey",u)}},D=u=>{u.key==="Enter"&&C()};return $?e.jsxs("div",{className:"container page-content",children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem",gap:"0.5rem",flexWrap:"wrap"},children:[e.jsx("h1",{style:{fontSize:"1.25rem",fontWeight:700,letterSpacing:"-0.02em"},children:"⚙️ Admin Dashboard"}),e.jsx("button",{className:"btn btn-ghost btn-sm",onClick:()=>{p(!1),x(""),localStorage.removeItem("adminSecretKey")},children:"🚪 Logout"})]}),e.jsx("div",{className:"tabs",style:{maxWidth:"100%"},children:N.map((u,j)=>e.jsx("button",{className:`tab-btn ${E===j?"active":""}`,onClick:()=>d(j),children:u.label},j))}),N[E].component]}):e.jsx("div",{className:"container",children:e.jsxs("div",{className:"login-box card",children:[e.jsx("div",{style:{fontSize:"3rem",marginBottom:"1rem"},children:"🔐"}),e.jsx("h2",{children:"Admin Access"}),e.jsx("p",{children:"Enter the admin secret key to manage timetables."}),e.jsx("div",{className:"form-group",children:e.jsx("input",{className:"form-input",type:"password",placeholder:"Secret key...",value:w,onChange:u=>T(u.target.value),onKeyDown:D})}),e.jsx("button",{className:"btn btn-primary btn-lg",onClick:C,style:{width:"100%"},children:"🔓 Unlock Dashboard"})]})})}export{ee as default};
