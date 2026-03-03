import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as n}from"./index.DiEladB3.js";const c=()=>{const[r,o]=n.useState("light");n.useEffect(()=>{const t=localStorage.getItem("theme"),a=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light",s=t||a;o(s),document.documentElement.setAttribute("data-theme",s)},[]);const i=()=>{const t=r==="light"?"dark":"light";o(t),document.documentElement.setAttribute("data-theme",t),localStorage.setItem("theme",t)};return e.jsxs("button",{onClick:i,className:"theme-toggle","aria-label":`Switch to ${r==="light"?"dark":"light"} mode`,children:[r==="light"?e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"})}):e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"5"}),e.jsx("line",{x1:"12",y1:"1",x2:"12",y2:"3"}),e.jsx("line",{x1:"12",y1:"21",x2:"12",y2:"23"}),e.jsx("line",{x1:"4.22",y1:"4.22",x2:"5.64",y2:"5.64"}),e.jsx("line",{x1:"18.36",y1:"18.36",x2:"19.78",y2:"19.78"}),e.jsx("line",{x1:"1",y1:"12",x2:"3",y2:"12"}),e.jsx("line",{x1:"21",y1:"12",x2:"23",y2:"12"}),e.jsx("line",{x1:"4.22",y1:"18.36",x2:"5.64",y2:"19.78"}),e.jsx("line",{x1:"18.36",y1:"4.22",x2:"19.78",y2:"5.64"})]}),e.jsx("style",{children:`
        .theme-toggle {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--text-primary);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          padding: 0;
          outline: none;
        }
        .theme-toggle:hover {
          background: var(--bg-card-hover);
          border-color: var(--accent-primary);
          transform: scale(1.05);
          box-shadow: var(--shadow);
        }
        .theme-toggle svg {
          stroke: var(--text-primary);
        }
      `})]})};export{c as default};
