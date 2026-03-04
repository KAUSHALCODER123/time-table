import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_CbvSu98a.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_KX83eLjL.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useRef, useCallback, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
export { renderers } from '../renderers.mjs';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function TimetableView() {
  const [entries, setEntries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [viewMode, setViewMode] = useState("class");
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const timetableRef = useRef(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ttRes, clsRes, tplRes] = await Promise.all([
        fetch("/api/timetable"),
        fetch("/api/classes"),
        fetch("/api/templates")
      ]);
      const [tt, cls, tpl] = await Promise.all([ttRes.json(), clsRes.json(), tplRes.json()]);
      setEntries(Array.isArray(tt) ? tt : []);
      setClasses(Array.isArray(cls) ? cls : []);
      setTemplates(Array.isArray(tpl) ? tpl : []);
      if (Array.isArray(cls) && cls.length > 0 && !selectedClass) {
        setSelectedClass(cls[0].id);
      }
    } catch (e) {
      console.error("Failed to load timetable", e);
    }
    setLoading(false);
  }, [selectedClass]);
  useEffect(() => {
    load();
  }, [load]);
  const filteredEntries = entries.filter((e) => e.class_id === selectedClass);
  const selectedClassObj = classes.find((c) => c.id === selectedClass);
  const classTemplate = templates.find((t) => t.id === selectedClassObj?.template_id);
  const classSlots = classTemplate?.slots || [];
  const classLookup = {};
  for (const e of filteredEntries) {
    classLookup[`${e.day}_${e.slot_index}`] = e;
  }
  const dayEntries = entries.filter((e) => e.day === selectedDay);
  const dayLookup = {};
  for (const e of dayEntries) {
    dayLookup[`${e.class_id}_${e.slot_index}`] = e;
  }
  const maxSlots = Math.max(...templates.map((t) => t.slots?.length || 0), 0);
  const columnIndices = Array.from({ length: maxSlots }, (_, i) => i);
  const handleDownloadPDF = async () => {
    if (!timetableRef.current) return;
    setDownloading(true);
    try {
      const element = timetableRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#000000"
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "l" : "p",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2]
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      const fileName = viewMode === "class" ? `Timetable-${selectedClassObj?.name.replace(/\s+/g, "-")}` : `Timetable-${selectedDay}`;
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error("PDF Generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "loading-overlay", children: [
      /* @__PURE__ */ jsx("span", { className: "spinner" }),
      " Loading timetable..."
    ] });
  }
  if (entries.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "empty-state fade-in", children: [
      /* @__PURE__ */ jsx("div", { className: "icon", children: "📅" }),
      /* @__PURE__ */ jsx("p", { children: "No timetable has been generated yet." }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: "0.85rem", color: "var(--text-muted)" }, children: "Ask your admin to generate a timetable from the admin dashboard." })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "fade-in", children: [
    /* @__PURE__ */ jsxs("div", { className: "tv-toolbar", children: [
      /* @__PURE__ */ jsxs("div", { className: "tv-toolbar-left", children: [
        /* @__PURE__ */ jsxs("div", { className: "tv-toggle", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `tv-toggle-btn ${viewMode === "class" ? "active" : ""}`,
              onClick: () => setViewMode("class"),
              children: "🏫 By Class"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `tv-toggle-btn ${viewMode === "day" ? "active" : ""}`,
              onClick: () => setViewMode("day"),
              children: "📅 By Day"
            }
          )
        ] }),
        viewMode === "class" ? /* @__PURE__ */ jsxs("div", { className: "tv-selector-group", children: [
          /* @__PURE__ */ jsx(
            "select",
            {
              className: "form-select tv-select",
              value: selectedClass,
              onChange: (e) => setSelectedClass(e.target.value),
              children: classes.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.name }, c.id))
            }
          ),
          classTemplate && /* @__PURE__ */ jsxs("span", { className: "badge badge-purple", children: [
            "🕐 ",
            classTemplate.name
          ] })
        ] }) : /* @__PURE__ */ jsx("div", { className: "tv-selector-group", children: /* @__PURE__ */ jsx(
          "select",
          {
            className: "form-select tv-select",
            value: selectedDay,
            onChange: (e) => setSelectedDay(e.target.value),
            children: DAYS.map((day) => /* @__PURE__ */ jsx("option", { value: day, children: day }, day))
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "btn btn-ghost btn-sm",
          onClick: handleDownloadPDF,
          disabled: downloading || viewMode === "class" && classSlots.length === 0,
          children: downloading ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "spinner" }),
            " Generating..."
          ] }) : /* @__PURE__ */ jsx(Fragment, { children: "📥 PDF" })
        }
      )
    ] }),
    viewMode === "class" ? classSlots.length === 0 ? /* @__PURE__ */ jsx("div", { className: "empty-state", children: /* @__PURE__ */ jsx("p", { children: "No time slots found for this class template." }) }) : /* @__PURE__ */ jsx("div", { className: "timetable-wrapper", ref: timetableRef, children: /* @__PURE__ */ jsxs("div", { className: "tv-table-inner", children: [
      /* @__PURE__ */ jsxs("h2", { className: "tv-table-title", children: [
        selectedClassObj?.name,
        " — Weekly Schedule"
      ] }),
      /* @__PURE__ */ jsxs("table", { className: "timetable tv-table", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "tv-th-corner", children: "Day" }),
          classSlots.map((s, i) => /* @__PURE__ */ jsxs("th", { children: [
            /* @__PURE__ */ jsx("div", { className: "tv-th-label", children: s.label }),
            /* @__PURE__ */ jsxs("div", { className: "tv-th-time", children: [
              s.start_time,
              " – ",
              s.end_time
            ] })
          ] }, i))
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: DAYS.map((day) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "tv-day-cell", children: day }),
          classSlots.map((_, si) => {
            const entry = classLookup[`${day}_${si}`];
            return /* @__PURE__ */ jsx("td", { className: entry ? "tv-filled" : "tv-empty", children: entry ? /* @__PURE__ */ jsxs("div", { className: "tv-chip", children: [
              /* @__PURE__ */ jsx("span", { className: "tv-chip-name", children: entry.teachers?.name || "—" }),
              entry.teachers?.subject && /* @__PURE__ */ jsx("span", { className: "tv-chip-subject", children: entry.teachers.subject })
            ] }) : /* @__PURE__ */ jsx("span", { className: "tv-dash", children: "—" }) }, si);
          })
        ] }, day)) })
      ] })
    ] }) }) : (
      /* ── Day-wise View ── */
      /* @__PURE__ */ jsx("div", { className: "timetable-wrapper", ref: timetableRef, children: /* @__PURE__ */ jsxs("div", { className: "tv-table-inner", children: [
        /* @__PURE__ */ jsxs("h2", { className: "tv-table-title", children: [
          selectedDay,
          " — All Classes"
        ] }),
        /* @__PURE__ */ jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxs("table", { className: "timetable tv-table", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "tv-th-corner", children: "Class" }),
            columnIndices.map((i) => {
              const anyTpl = templates.find((t) => t.slots && t.slots[i]);
              const slotInfo = anyTpl?.slots?.[i];
              return /* @__PURE__ */ jsxs("th", { children: [
                /* @__PURE__ */ jsxs("div", { className: "tv-th-label", children: [
                  "P",
                  i + 1
                ] }),
                slotInfo && /* @__PURE__ */ jsxs("div", { className: "tv-th-time", children: [
                  slotInfo.start_time,
                  " – ",
                  slotInfo.end_time
                ] })
              ] }, i);
            })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: classes.map((c) => {
            const t = templates.find((tpl) => tpl.id === c.template_id);
            return /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "tv-day-cell", children: c.name }),
              columnIndices.map((si) => {
                const entry = dayLookup[`${c.id}_${si}`];
                const slotInfo = t?.slots?.[si];
                const isOutOfRange = !slotInfo;
                return /* @__PURE__ */ jsx("td", { className: isOutOfRange ? "tv-na" : entry ? "tv-filled" : "tv-empty", children: isOutOfRange ? /* @__PURE__ */ jsx("span", { className: "tv-dash-na", children: "—" }) : entry ? /* @__PURE__ */ jsxs("div", { className: "tv-chip", children: [
                  /* @__PURE__ */ jsx("span", { className: "tv-chip-name", children: entry.teachers?.name || "—" }),
                  entry.teachers?.subject && /* @__PURE__ */ jsx("span", { className: "tv-chip-subject", children: entry.teachers.subject })
                ] }) : /* @__PURE__ */ jsx("span", { className: "tv-dash", children: "—" }) }, si);
              })
            ] }, c.id);
          }) })
        ] }) })
      ] }) })
    ),
    /* @__PURE__ */ jsx("style", { children: `
                /* ── Toolbar ── */
                .tv-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    padding: 0.6rem 1rem;
                    margin-bottom: 1.25rem;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    flex-wrap: wrap;
                }
                .tv-toolbar-left {
                    display: flex;
                    align-items: center;
                    gap: 0.85rem;
                    flex-wrap: wrap;
                }
                /* ── Segmented Toggle ── */
                .tv-toggle {
                    display: inline-flex;
                    background: var(--bg-primary);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    padding: 3px;
                    gap: 2px;
                }
                .tv-toggle-btn {
                    padding: 0.45rem 1rem;
                    border: none;
                    background: transparent;
                    font-family: inherit;
                    font-size: 0.82rem;
                    font-weight: 500;
                    color: var(--text-secondary);
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.25s ease;
                    white-space: nowrap;
                }
                .tv-toggle-btn:hover {
                    color: var(--text-primary);
                }
                .tv-toggle-btn.active {
                    background: var(--accent-primary);
                    color: #fff;
                    box-shadow: 0 2px 8px var(--accent-glow);
                }
                /* ── Selector group ── */
                .tv-selector-group {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                }
                .tv-select {
                    max-width: 180px;
                    padding: 0.5rem 0.85rem !important;
                    border-radius: 8px !important;
                    font-size: 0.85rem !important;
                }
                /* ── Table Styling ── */
                .tv-table-inner {
                    padding: 1.5rem;
                }
                .tv-table-title {
                    text-align: center;
                    font-size: 1.15rem;
                    font-weight: 600;
                    letter-spacing: -0.02em;
                    margin-bottom: 1.25rem;
                    color: var(--text-primary);
                }
                .tv-table {
                    border-collapse: separate !important;
                    border-spacing: 0;
                    border-radius: var(--radius);
                    overflow: hidden;
                }
                .tv-table thead th {
                    background: var(--bg-primary);
                    color: var(--text-secondary);
                    font-weight: 600;
                    font-size: 0.78rem;
                    padding: 0.85rem 0.75rem;
                    text-align: center;
                    border-bottom: 2px solid var(--border);
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }
                .tv-th-corner {
                    text-align: left !important;
                    min-width: 90px;
                }
                .tv-th-label {
                    font-weight: 600;
                }
                .tv-th-time {
                    font-size: 0.65rem;
                    font-weight: 400;
                    opacity: 0.65;
                    margin-top: 2px;
                    text-transform: none;
                    letter-spacing: 0;
                }
                .tv-table tbody th {
                    background: var(--bg-primary);
                    font-weight: 600;
                    font-size: 0.82rem;
                    text-align: left;
                    padding: 0.85rem 0.75rem;
                    color: var(--text-primary);
                    white-space: nowrap;
                }
                .tv-day-cell {
                    min-width: 90px;
                }
                .tv-table tbody td {
                    padding: 0.5rem;
                    text-align: center;
                    border: 1px solid var(--border);
                    vertical-align: middle;
                    transition: background 0.2s;
                    min-width: 110px;
                }
                .tv-table tbody td:hover {
                    background: var(--bg-card-hover);
                }
                /* ── Chip (filled cell) ── */
                .tv-chip {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                    padding: 0.5rem 0.4rem;
                    background: var(--accent-glow);
                    border: 1px solid rgba(0, 113, 227, 0.15);
                    border-radius: 8px;
                    transition: transform 0.2s;
                }
                .tv-chip:hover {
                    transform: scale(1.03);
                }
                .tv-chip-name {
                    font-weight: 600;
                    font-size: 0.82rem;
                    color: var(--text-primary);
                    line-height: 1.2;
                }
                .tv-chip-subject {
                    font-size: 0.68rem;
                    color: var(--accent-primary);
                    font-weight: 500;
                }
                .tv-dash {
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    opacity: 0.5;
                }
                .tv-na {
                    background: var(--bg-primary) !important;
                    opacity: 0.35;
                }
                .tv-dash-na {
                    color: var(--text-muted);
                    font-size: 0.75rem;
                }
                @media (max-width: 640px) {
                    .tv-toolbar {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .tv-toolbar-left {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .tv-toggle {
                        width: 100%;
                    }
                    .tv-toggle-btn {
                        flex: 1;
                        text-align: center;
                    }
                    .tv-select {
                        max-width: none;
                    }
                }
            ` })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Timetable \u2014 View Schedule" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container page-content"> <div class="hero"> <h1>📅 School Timetable</h1> <p>
View the auto-generated weekly schedule for each class. Select
				your class below to see the timetable.
</p> </div> ${renderComponent($$result2, "TimetableView", TimetableView, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Yamini Warekar/Downloads/time-table-main/time-table-main/src/components/TimetableView", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Users/Yamini Warekar/Downloads/time-table-main/time-table-main/src/pages/index.astro", void 0);

const $$file = "C:/Users/Yamini Warekar/Downloads/time-table-main/time-table-main/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
