import { e as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_CbvSu98a.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_KX83eLjL.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useCallback, useEffect } from 'react';
export { renderers } from '../renderers.mjs';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function TimetableEditor({ adminKey }) {
  const [entries, setEntries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState("class");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [draggedTeacher, setDraggedTeacher] = useState(null);
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [ttRes, clsRes, teaRes, tplRes] = await Promise.all([
        fetch("/api/timetable"),
        fetch("/api/classes"),
        fetch("/api/teachers"),
        fetch("/api/templates")
      ]);
      const [tt, cls, tea, tpl] = await Promise.all([ttRes.json(), clsRes.json(), teaRes.json(), tplRes.json()]);
      setEntries(Array.isArray(tt) ? tt : []);
      setClasses(Array.isArray(cls) ? cls : []);
      setTeachers(Array.isArray(tea) ? tea : []);
      setTemplates(Array.isArray(tpl) ? tpl : []);
      if (Array.isArray(cls) && cls.length > 0 && !selectedClass) {
        setSelectedClass(cls[0].id);
      }
    } catch (e) {
      console.error("Failed to load data", e);
    }
    if (!silent) setLoading(false);
  }, [selectedClass]);
  useEffect(() => {
    load();
  }, [load]);
  const handleUpdateEntry = async (classId, day, slotIndex, teacherId) => {
    setSaving(true);
    try {
      if (teacherId === null) {
        const res = await fetch(`/api/timetable?class_id=${classId}&day=${day}&slot_index=${slotIndex}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${adminKey}` }
        });
        if (!res.ok) throw new Error("Delete failed");
      } else {
        const res = await fetch("/api/timetable", {
          method: "PATCH",
          headers: { "Authorization": `Bearer ${adminKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ class_id: classId, day, slot_index: slotIndex, teacher_id: teacherId })
        });
        if (!res.ok) throw new Error("Update failed");
      }
      await load(true);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };
  const lookup = {};
  for (const e of entries) {
    lookup[`${e.day}_${e.slot_index}_${e.class_id}`] = e;
  }
  const conflicts = /* @__PURE__ */ new Set();
  const teacherSlots = {};
  for (const e of entries) {
    const key = `${e.day}_${e.slot_index}_${e.teacher_id}`;
    if (!teacherSlots[key]) teacherSlots[key] = [];
    teacherSlots[key].push(e.class_id);
  }
  for (const key in teacherSlots) {
    if (teacherSlots[key].length > 1) {
      teacherSlots[key].forEach((classId) => {
        const parts = key.split("_");
        conflicts.add(`${parts[0]}_${parts[1]}_${classId}`);
      });
    }
  }
  const onTeacherDragStart = (teacher) => {
    setDraggedTeacher(teacher);
  };
  const onDropOnSlot = (classId, day, slotIndex) => {
    if (!draggedTeacher) return;
    const conflictingEntry = entries.find(
      (e) => e.teacher_id === draggedTeacher.id && e.day === day && e.slot_index === slotIndex && e.class_id !== classId
    );
    if (conflictingEntry) {
      const conflictClass = classes.find((c) => c.id === conflictingEntry.class_id);
      const confirmed = window.confirm(
        `⚠️ Scheduling Conflict!

${draggedTeacher.name} is already assigned to "${conflictClass?.name || "another class"}" on ${day} during Period ${slotIndex + 1}.

Assigning them here will create a double-booking.

Do you want to proceed anyway?`
      );
      if (!confirmed) {
        setDraggedTeacher(null);
        return;
      }
    }
    handleUpdateEntry(classId, day, slotIndex, draggedTeacher.id);
    setDraggedTeacher(null);
  };
  const renderClassWise = () => {
    const cls = classes.find((c) => c.id === selectedClass);
    const tpl = templates.find((t) => t.id === cls?.template_id);
    const slots = tpl?.slots || [];
    if (!cls) return /* @__PURE__ */ jsx("div", { className: "empty-state", children: "Select a class" });
    if (slots.length === 0) return /* @__PURE__ */ jsx("div", { className: "empty-state", children: "No slots defined for this class template" });
    return /* @__PURE__ */ jsx("div", { className: "timetable-wrapper", children: /* @__PURE__ */ jsxs("table", { className: "timetable editable", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { children: "Day / Period" }),
        slots.map((s, i) => /* @__PURE__ */ jsxs("th", { children: [
          /* @__PURE__ */ jsx("div", { children: s.label }),
          /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.7rem", opacity: 0.7 }, children: [
            s.start_time,
            "-",
            s.end_time
          ] })
        ] }, i))
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: DAYS.map((day) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { children: day }),
        slots.map((_, si) => {
          const entry = lookup[`${day}_${si}_${selectedClass}`];
          const hasConflict = conflicts.has(`${day}_${si}_${selectedClass}`);
          return /* @__PURE__ */ jsx(
            "td",
            {
              className: `slot-cell ${hasConflict ? "conflict" : ""}`,
              onDragOver: (e) => e.preventDefault(),
              onDrop: () => onDropOnSlot(selectedClass, day, si),
              children: selectedClass && /* @__PURE__ */ jsx(Fragment, { children: entry ? /* @__PURE__ */ jsxs("div", { className: "assignment-box", children: [
                /* @__PURE__ */ jsx("div", { className: "teacher-name", children: entry.teachers?.name || "—" }),
                /* @__PURE__ */ jsx("div", { className: "teacher-subject", children: entry.teachers?.subject }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: "remove-btn",
                    onClick: () => handleUpdateEntry(selectedClass, day, si, null),
                    title: "Remove assignment",
                    children: "×"
                  }
                )
              ] }) : /* @__PURE__ */ jsx("div", { className: "empty-slot", children: "Drop here" }) })
            },
            si
          );
        })
      ] }, day)) })
    ] }) });
  };
  const maxSlots = Math.max(...templates.map((t) => t.slots?.length || 0), 0);
  const editorColumnIndices = Array.from({ length: maxSlots }, (_, i) => i);
  const renderDayWise = () => {
    return /* @__PURE__ */ jsx("div", { className: "timetable-wrapper", children: /* @__PURE__ */ jsxs("table", { className: "timetable editable", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { children: "Class" }),
        editorColumnIndices.map((i) => {
          const anyTpl = templates.find((t) => t.slots && t.slots[i]);
          const slotInfo = anyTpl?.slots?.[i];
          return /* @__PURE__ */ jsxs("th", { children: [
            /* @__PURE__ */ jsx("div", { children: slotInfo?.label || `P${i + 1}` }),
            slotInfo && /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.7rem", opacity: 0.7 }, children: [
              slotInfo.start_time,
              "-",
              slotInfo.end_time
            ] })
          ] }, i);
        })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: classes.map((cls) => {
        const tpl = templates.find((t) => t.id === cls.template_id);
        const slots = tpl?.slots || [];
        return /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { children: cls.name }),
          editorColumnIndices.map((si) => {
            if (si >= slots.length) return /* @__PURE__ */ jsx("td", { className: "locked-cell", children: "—" }, si);
            const entry = lookup[`${selectedDay}_${si}_${cls.id}`];
            const hasConflict = conflicts.has(`${selectedDay}_${si}_${cls.id}`);
            return /* @__PURE__ */ jsx(
              "td",
              {
                className: `slot-cell ${hasConflict ? "conflict" : ""}`,
                onDragOver: (e) => e.preventDefault(),
                onDrop: () => onDropOnSlot(cls.id, selectedDay, si),
                children: entry ? /* @__PURE__ */ jsxs("div", { className: "assignment-box", children: [
                  /* @__PURE__ */ jsx("div", { className: "teacher-name", children: entry.teachers?.name || "—" }),
                  /* @__PURE__ */ jsx("div", { className: "teacher-subject", children: entry.teachers?.subject }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      className: "remove-btn",
                      onClick: () => handleUpdateEntry(cls.id, selectedDay, si, null),
                      children: "×"
                    }
                  )
                ] }) : /* @__PURE__ */ jsx("div", { className: "empty-slot", children: "+" })
              },
              si
            );
          })
        ] }, cls.id);
      }) })
    ] }) });
  };
  if (loading) return /* @__PURE__ */ jsxs("div", { className: "loading-overlay", children: [
    /* @__PURE__ */ jsx("span", { className: "spinner" }),
    " Loading Editor..."
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "editor-container fade-in", children: [
    /* @__PURE__ */ jsxs("div", { className: "editor-layout", children: [
      /* @__PURE__ */ jsxs("div", { className: "editor-sidebar", children: [
        /* @__PURE__ */ jsx("h3", { className: "section-title", children: "👨‍🏫 Teachers" }),
        /* @__PURE__ */ jsx("p", { className: "hint text-muted", children: "Drag a teacher to an empty slot" }),
        /* @__PURE__ */ jsx("div", { className: "teacher-drag-list", children: teachers.map((t) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "draggable-teacher card",
            draggable: true,
            onDragStart: () => onTeacherDragStart(t),
            children: [
              /* @__PURE__ */ jsx("div", { className: "teacher-name", children: t.name }),
              /* @__PURE__ */ jsx("div", { className: "teacher-subject", children: t.subject })
            ]
          },
          t.id
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "editor-main", children: [
        /* @__PURE__ */ jsxs("div", { className: "editor-header nav-row", children: [
          /* @__PURE__ */ jsxs("div", { className: "view-toggle", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: `ed-toggle-btn ${viewMode === "class" ? "active" : ""}`,
                onClick: () => setViewMode("class"),
                children: "📅 Day View"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: `ed-toggle-btn ${viewMode === "day" ? "active" : ""}`,
                onClick: () => setViewMode("day"),
                children: "🏫 Class View"
              }
            )
          ] }),
          viewMode === "class" ? /* @__PURE__ */ jsxs("div", { className: "filter-item", children: [
            /* @__PURE__ */ jsx("label", { children: "Select Class:" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                className: "form-select",
                value: selectedClass,
                onChange: (e) => setSelectedClass(e.target.value),
                style: { minWidth: "150px" },
                children: classes.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.name }, c.id))
              }
            )
          ] }) : /* @__PURE__ */ jsxs("div", { className: "filter-item", children: [
            /* @__PURE__ */ jsx("label", { children: "Select Day:" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                className: "form-select",
                value: selectedDay,
                onChange: (e) => setSelectedDay(e.target.value),
                style: { minWidth: "150px" },
                children: DAYS.map((d) => /* @__PURE__ */ jsx("option", { value: d, children: d }, d))
              }
            )
          ] }),
          saving && /* @__PURE__ */ jsxs("span", { className: "saving-indicator", children: [
            /* @__PURE__ */ jsx("span", { className: "spinner" }),
            " Saving..."
          ] })
        ] }),
        viewMode === "class" ? renderClassWise() : renderDayWise()
      ] })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `
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
            ` })
  ] });
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3e3);
    return () => clearTimeout(t);
  }, [onClose]);
  return /* @__PURE__ */ jsxs("div", { className: `toast toast-${type}`, children: [
    type === "success" ? "✓" : "✕",
    " ",
    message
  ] });
}
function apiHeaders(adminKey) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminKey}`
  };
}
async function apiFetch(url, adminKey, options) {
  const res = await fetch(url, {
    ...options,
    headers: { ...apiHeaders(adminKey), ...options?.headers || {} }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
function TemplatesTab({ adminKey }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slots, setSlots] = useState([{ label: "Period 1", start_time: "08:00", end_time: "08:45" }]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiFetch("/api/templates", adminKey);
      setTemplates(data);
    } catch {
    }
    if (!silent) setLoading(false);
  }, [adminKey]);
  useEffect(() => {
    load();
  }, [load]);
  const addSlot = () => {
    const n = slots.length + 1;
    setSlots([...slots, { label: `Period ${n}`, start_time: "", end_time: "" }]);
  };
  const removeSlot = (i) => setSlots(slots.filter((_, idx) => idx !== i));
  const updateSlot = (i, field, value) => {
    const updated = [...slots];
    updated[i] = { ...updated[i], [field]: value };
    setSlots(updated);
  };
  const handleCreateOrUpdate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await apiFetch("/api/templates", adminKey, {
          method: "PUT",
          body: JSON.stringify({ id: editingId, name, slots })
        });
        setToast({ msg: `Template "${name}" updated!`, type: "success" });
      } else {
        await apiFetch("/api/templates", adminKey, {
          method: "POST",
          body: JSON.stringify({ name, slots })
        });
        setToast({ msg: `Template "${name}" created!`, type: "success" });
      }
      handleCancel();
      load(true);
    } catch (e) {
      setToast({ msg: e.message, type: "error" });
    }
    setSaving(false);
  };
  const handleEdit = (t) => {
    setEditingId(t.id);
    setName(t.name);
    setSlots(t.slots || [{ label: "Period 1", start_time: "08:00", end_time: "08:45" }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setSlots([{ label: "Period 1", start_time: "08:00", end_time: "08:45" }]);
  };
  const handleDelete = async (id, tplName) => {
    if (!confirm(`Delete template "${tplName}"?`)) return;
    try {
      await apiFetch(`/api/templates?id=${id}`, adminKey, { method: "DELETE" });
      setToast({ msg: "Template deleted", type: "success" });
      if (editingId === id) handleCancel();
      load(true);
    } catch (e) {
      setToast({ msg: e.message, type: "error" });
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "fade-in", children: [
    toast && /* @__PURE__ */ jsx(Toast, { message: toast.msg, type: toast.type, onClose: () => setToast(null) }),
    /* @__PURE__ */ jsxs("div", { className: `card ${editingId ? "editing-pulse" : ""}`, style: { marginBottom: "1.5rem" }, children: [
      /* @__PURE__ */ jsxs("div", { className: "card-header", children: [
        /* @__PURE__ */ jsx("span", { className: "card-title", children: editingId ? "✏️ Edit Time Slot Template" : "➕ Create Time Slot Template" }),
        editingId && /* @__PURE__ */ jsx("button", { className: "btn btn-ghost btn-sm", onClick: handleCancel, children: "Cancel" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: "Template Name" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: "form-input",
            placeholder: "e.g. Morning Session, Afternoon Session",
            value: name,
            onChange: (e) => setName(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsx("label", { className: "form-label", children: "Lecture Periods" }),
      /* @__PURE__ */ jsx("div", { className: "slot-list", children: slots.map((s, i) => /* @__PURE__ */ jsxs("div", { className: "slot-item", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            className: "form-input",
            style: { maxWidth: 120 },
            placeholder: "Label",
            value: s.label,
            onChange: (e) => updateSlot(i, "label", e.target.value)
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: "form-input",
            type: "time",
            style: { maxWidth: 130 },
            value: s.start_time,
            onChange: (e) => updateSlot(i, "start_time", e.target.value)
          }
        ),
        /* @__PURE__ */ jsx("span", { style: { color: "var(--text-muted)" }, children: "→" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: "form-input",
            type: "time",
            style: { maxWidth: 130 },
            value: s.end_time,
            onChange: (e) => updateSlot(i, "end_time", e.target.value)
          }
        ),
        slots.length > 1 && /* @__PURE__ */ jsx("button", { className: "btn btn-danger btn-sm", onClick: () => removeSlot(i), children: "✕" })
      ] }, i)) }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.75rem", marginTop: "1rem" }, children: [
        /* @__PURE__ */ jsx("button", { className: "btn btn-ghost btn-sm", onClick: addSlot, children: "+ Add Period" }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-primary", onClick: handleCreateOrUpdate, disabled: saving || !name.trim(), children: saving ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "spinner" }),
          " Saving..."
        ] }) : editingId ? "💾 Update Template" : "💾 Save Template" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("h3", { className: "section-title", children: "📋 Existing Templates" }),
    loading ? /* @__PURE__ */ jsxs("div", { className: "loading-overlay", children: [
      /* @__PURE__ */ jsx("span", { className: "spinner" }),
      " Loading templates..."
    ] }) : templates.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "empty-state", children: [
      /* @__PURE__ */ jsx("div", { className: "icon", children: "🕐" }),
      /* @__PURE__ */ jsx("p", { children: "No templates yet. Create one above!" })
    ] }) : /* @__PURE__ */ jsx("div", { className: "card-grid", children: templates.map((t) => /* @__PURE__ */ jsxs("div", { className: `card ${editingId === t.id ? "active-border" : ""}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "card-header", children: [
        /* @__PURE__ */ jsx("span", { className: "card-title", children: t.name }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.4rem" }, children: [
          /* @__PURE__ */ jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => handleEdit(t), children: "Edit" }),
          /* @__PURE__ */ jsx("button", { className: "btn btn-danger btn-sm", onClick: () => handleDelete(t.id, t.name), children: "Delete" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "badge badge-purple", children: [
        t.slots?.length || 0,
        " periods"
      ] }),
      t.slots && t.slots.length > 0 && /* @__PURE__ */ jsx("div", { className: "slot-list", children: t.slots.map((s, i) => /* @__PURE__ */ jsxs("div", { className: "slot-item", children: [
        /* @__PURE__ */ jsx("span", { className: "slot-label", children: s.label }),
        /* @__PURE__ */ jsxs("span", { className: "slot-time", children: [
          s.start_time,
          " → ",
          s.end_time
        ] })
      ] }, i)) })
    ] }, t.id)) })
  ] });
}
function ClassesTab({ adminKey }) {
  const [classes, setClasses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [c, t] = await Promise.all([
        apiFetch("/api/classes", adminKey),
        apiFetch("/api/templates", adminKey)
      ]);
      setClasses(c);
      setTemplates(t);
    } catch {
    }
    if (!silent) setLoading(false);
  }, [adminKey]);
  useEffect(() => {
    load();
  }, [load]);
  const handleCreateOrUpdate = async () => {
    if (!name.trim() || !templateId) return;
    setSaving(true);
    try {
      if (editingId) {
        await apiFetch("/api/classes", adminKey, {
          method: "PUT",
          body: JSON.stringify({ id: editingId, name, template_id: templateId })
        });
        setToast({ msg: `Class "${name}" updated!`, type: "success" });
      } else {
        await apiFetch("/api/classes", adminKey, {
          method: "POST",
          body: JSON.stringify({ name, template_id: templateId })
        });
        setToast({ msg: `Class "${name}" added!`, type: "success" });
      }
      handleCancel();
      load(true);
    } catch (e) {
      setToast({ msg: e.message, type: "error" });
    }
    setSaving(false);
  };
  const handleEdit = (c) => {
    setEditingId(c.id);
    setName(c.name);
    setTemplateId(c.template_id || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setTemplateId("");
  };
  const handleDelete = async (id, clsName) => {
    if (!confirm(`Delete class "${clsName}"?`)) return;
    try {
      await apiFetch(`/api/classes?id=${id}`, adminKey, { method: "DELETE" });
      setToast({ msg: "Class deleted", type: "success" });
      if (editingId === id) handleCancel();
      load(true);
    } catch (e) {
      setToast({ msg: e.message, type: "error" });
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "fade-in", children: [
    toast && /* @__PURE__ */ jsx(Toast, { message: toast.msg, type: toast.type, onClose: () => setToast(null) }),
    /* @__PURE__ */ jsxs("div", { className: `card ${editingId ? "editing-pulse" : ""}`, style: { marginBottom: "1.5rem" }, children: [
      /* @__PURE__ */ jsxs("div", { className: "card-header", children: [
        /* @__PURE__ */ jsx("span", { className: "card-title", children: editingId ? "✏️ Edit Class" : "➕ Add Class" }),
        editingId && /* @__PURE__ */ jsx("button", { className: "btn btn-ghost btn-sm", onClick: handleCancel, children: "Cancel" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-inline", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: "Class Name" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "form-input",
              placeholder: "e.g. 1st Std, 4th Std",
              value: name,
              onChange: (e) => setName(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: "Time Slot Template" }),
          /* @__PURE__ */ jsxs("select", { className: "form-select", value: templateId, onChange: (e) => setTemplateId(e.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Select template..." }),
            templates.map((t) => /* @__PURE__ */ jsx("option", { value: t.id, children: t.name }, t.id))
          ] })
        ] }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-primary", onClick: handleCreateOrUpdate, disabled: saving || !name.trim() || !templateId, children: saving ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "spinner" }),
          " Saving..."
        ] }) : editingId ? "💾 Update" : "➕ Add" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("h3", { className: "section-title", children: "🏫 Classes" }),
    loading ? /* @__PURE__ */ jsxs("div", { className: "loading-overlay", children: [
      /* @__PURE__ */ jsx("span", { className: "spinner" }),
      " Loading..."
    ] }) : classes.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "empty-state", children: [
      /* @__PURE__ */ jsx("div", { className: "icon", children: "🏫" }),
      /* @__PURE__ */ jsx("p", { children: "No classes added yet." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "card-grid", children: classes.map((c) => /* @__PURE__ */ jsxs("div", { className: `card ${editingId === c.id ? "active-border" : ""}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "card-header", children: [
        /* @__PURE__ */ jsx("span", { className: "card-title", children: c.name }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.4rem" }, children: [
          /* @__PURE__ */ jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => handleEdit(c), children: "Edit" }),
          /* @__PURE__ */ jsx("button", { className: "btn btn-danger btn-sm", onClick: () => handleDelete(c.id, c.name), children: "Delete" })
        ] })
      ] }),
      c.time_slot_templates && /* @__PURE__ */ jsxs("span", { className: "badge badge-purple", children: [
        "📅 ",
        c.time_slot_templates.name
      ] })
    ] }, c.id)) })
  ] });
}
function TeachersTab({ adminKey }) {
  const [teachers, setTeachers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [t, tpl] = await Promise.all([
        apiFetch("/api/teachers", adminKey),
        apiFetch("/api/templates", adminKey)
      ]);
      setTeachers(t);
      setTemplates(tpl);
    } catch {
    }
    if (!silent) setLoading(false);
  }, [adminKey]);
  useEffect(() => {
    load();
  }, [load]);
  const handleCreateOrUpdate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await apiFetch("/api/teachers", adminKey, {
          method: "PUT",
          body: JSON.stringify({ id: editingId, name, subject })
        });
        setToast({ msg: `Teacher "${name}" updated!`, type: "success" });
      } else {
        await apiFetch("/api/teachers", adminKey, {
          method: "POST",
          body: JSON.stringify({ name, subject })
        });
        setToast({ msg: `Teacher "${name}" added!`, type: "success" });
      }
      handleCancel();
      load(true);
    } catch (e) {
      setToast({ msg: e.message, type: "error" });
    }
    setSaving(false);
  };
  const handleEdit = (t) => {
    setEditingId(t.id);
    setName(t.name);
    setSubject(t.subject);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setSubject("");
  };
  const handleDelete = async (id, tName) => {
    if (!confirm(`Delete teacher "${tName}"?`)) return;
    try {
      await apiFetch(`/api/teachers?id=${id}`, adminKey, { method: "DELETE" });
      setToast({ msg: "Teacher removed", type: "success" });
      if (editingId === id) handleCancel();
      load(true);
    } catch (e) {
      setToast({ msg: e.message, type: "error" });
    }
  };
  const handleAssign = async (teacherId, templateId) => {
    try {
      await apiFetch("/api/teacher-assignments", adminKey, {
        method: "POST",
        body: JSON.stringify({ teacher_id: teacherId, template_id: templateId })
      });
      setToast({ msg: "Teacher assigned to template!", type: "success" });
      load(true);
    } catch (e) {
      setToast({ msg: e.message, type: "error" });
    }
  };
  const handleUnassign = async (teacherId, templateId) => {
    try {
      await apiFetch(`/api/teacher-assignments?teacher_id=${teacherId}&template_id=${templateId}`, adminKey, {
        method: "DELETE"
      });
      setToast({ msg: "Assignment removed", type: "success" });
      load(true);
    } catch (e) {
      setToast({ msg: e.message, type: "error" });
    }
  };
  const getAssignedTemplateIds = (teacher) => {
    const set = /* @__PURE__ */ new Set();
    (teacher.teacher_slot_assignments || []).forEach((a) => set.add(a.template_id));
    return set;
  };
  return /* @__PURE__ */ jsxs("div", { className: "fade-in", children: [
    toast && /* @__PURE__ */ jsx(Toast, { message: toast.msg, type: toast.type, onClose: () => setToast(null) }),
    /* @__PURE__ */ jsxs("div", { className: `card ${editingId ? "editing-pulse" : ""}`, style: { marginBottom: "1.5rem" }, children: [
      /* @__PURE__ */ jsxs("div", { className: "card-header", children: [
        /* @__PURE__ */ jsx("span", { className: "card-title", children: editingId ? "✏️ Edit Teacher" : "➕ Add Teacher" }),
        editingId && /* @__PURE__ */ jsx("button", { className: "btn btn-ghost btn-sm", onClick: handleCancel, children: "Cancel" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-inline", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: "Name" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "form-input",
              placeholder: "Teacher name",
              value: name,
              onChange: (e) => setName(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: "Subject" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: "form-input",
              placeholder: "e.g. Math, English",
              value: subject,
              onChange: (e) => setSubject(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-primary", onClick: handleCreateOrUpdate, disabled: saving || !name.trim(), children: saving ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "spinner" }),
          " Saving..."
        ] }) : editingId ? "💾 Update" : "➕ Add" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("h3", { className: "section-title", children: "👩‍🏫 Teachers" }),
    loading ? /* @__PURE__ */ jsxs("div", { className: "loading-overlay", children: [
      /* @__PURE__ */ jsx("span", { className: "spinner" }),
      " Loading..."
    ] }) : teachers.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "empty-state", children: [
      /* @__PURE__ */ jsx("div", { className: "icon", children: "👩‍🏫" }),
      /* @__PURE__ */ jsx("p", { children: "No teachers added yet." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "card-grid", children: teachers.map((t) => {
      const assignedIds = getAssignedTemplateIds(t);
      return /* @__PURE__ */ jsxs("div", { className: `card ${editingId === t.id ? "active-border" : ""}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "card-header", children: [
          /* @__PURE__ */ jsx("span", { className: "card-title", children: t.name }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.4rem" }, children: [
            /* @__PURE__ */ jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => handleEdit(t), children: "Edit" }),
            /* @__PURE__ */ jsx("button", { className: "btn btn-danger btn-sm", onClick: () => handleDelete(t.id, t.name), children: "Delete" })
          ] })
        ] }),
        t.subject && /* @__PURE__ */ jsxs("span", { className: "badge badge-yellow", style: { marginBottom: "0.75rem" }, children: [
          "📚 ",
          t.subject
        ] }),
        /* @__PURE__ */ jsx("label", { className: "form-label", style: { marginTop: "0.5rem" }, children: "Assigned Templates" }),
        /* @__PURE__ */ jsxs("div", { className: "assign-row", children: [
          templates.map((tpl) => {
            const isAssigned = assignedIds.has(tpl.id);
            return /* @__PURE__ */ jsxs("label", { className: "toggle-row", title: isAssigned ? "Click to unassign" : "Click to assign", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: isAssigned,
                  onChange: () => isAssigned ? handleUnassign(t.id, tpl.id) : handleAssign(t.id, tpl.id)
                }
              ),
              tpl.name
            ] }, tpl.id);
          }),
          templates.length === 0 && /* @__PURE__ */ jsx("span", { style: { color: "var(--text-muted)", fontSize: "0.8rem" }, children: "Create templates first" })
        ] })
      ] }, t.id);
    }) })
  ] });
}
function GenerateTab({ adminKey }) {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [classesList, setClassesList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [templatesList, setTemplatesList] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState(/* @__PURE__ */ new Set());
  const [selectedTeachers, setSelectedTeachers] = useState(/* @__PURE__ */ new Set());
  const [selectedTemplates, setSelectedTemplates] = useState(/* @__PURE__ */ new Set());
  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const [selectedDays, setSelectedDays] = useState(/* @__PURE__ */ new Set(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]));
  useEffect(() => {
    Promise.all([
      apiFetch("/api/classes", adminKey),
      apiFetch("/api/teachers", adminKey),
      apiFetch("/api/templates", adminKey)
    ]).then(([c, t, tpl]) => {
      setClassesList(c);
      setTeachersList(t);
      setTemplatesList(tpl);
      setSelectedClasses(new Set(c.map((x) => x.id)));
      setSelectedTeachers(new Set(t.map((x) => x.id)));
      setSelectedTemplates(new Set(tpl.map((x) => x.id)));
    }).catch(() => {
    });
  }, [adminKey]);
  const toggleSet = (set, val, updater) => {
    const nextSet = new Set(set);
    if (nextSet.has(val)) nextSet.delete(val);
    else nextSet.add(val);
    updater(nextSet);
  };
  const handleGenerate = async () => {
    if (!confirm("This will overwrite timetables for the selected targets. Continue?")) return;
    setGenerating(true);
    setResult(null);
    try {
      const data = await apiFetch("/api/generate", adminKey, {
        method: "POST",
        body: JSON.stringify({
          class_ids: Array.from(selectedClasses),
          template_ids: Array.from(selectedTemplates),
          teacher_ids: Array.from(selectedTeachers),
          days: Array.from(selectedDays)
        })
      });
      setResult(data);
      setToast({ msg: data.message, type: "success" });
    } catch (e) {
      setResult({ success: false, message: e.message });
      setToast({ msg: e.message, type: "error" });
    }
    setGenerating(false);
  };
  return /* @__PURE__ */ jsxs("div", { className: "fade-in", children: [
    toast && /* @__PURE__ */ jsx(Toast, { message: toast.msg, type: toast.type, onClose: () => setToast(null) }),
    /* @__PURE__ */ jsxs("div", { className: "card", style: { padding: "1.25rem" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", marginBottom: "1.5rem" }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: "2.5rem", marginBottom: "0.4rem" }, children: "🪄" }),
        /* @__PURE__ */ jsx("h2", { style: { fontSize: "1.2rem", fontWeight: 700 }, children: "Selective Auto-Generation" }),
        /* @__PURE__ */ jsx("p", { style: { color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.4, marginTop: "0.3rem" }, children: "Choose targets carefully. Unselected items will be excluded." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-row", style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }, children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxs("h4", { style: { marginBottom: "0.5rem", color: "var(--accent-secondary)" }, children: [
            "🗓️ Days (",
            selectedDays.size,
            ")"
          ] }),
          /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.4rem", maxHeight: "150px", overflowY: "auto" }, children: allDays.map((d) => /* @__PURE__ */ jsxs("label", { className: "toggle-row", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: selectedDays.has(d), onChange: () => toggleSet(selectedDays, d, setSelectedDays) }),
            " ",
            d
          ] }, d)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxs("h4", { style: { marginBottom: "0.5rem", color: "var(--accent-secondary)" }, children: [
            "🕒 Templates (",
            selectedTemplates.size,
            ")"
          ] }),
          /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.4rem", maxHeight: "150px", overflowY: "auto" }, children: templatesList.map((t) => /* @__PURE__ */ jsxs("label", { className: "toggle-row", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: selectedTemplates.has(t.id), onChange: () => toggleSet(selectedTemplates, t.id, setSelectedTemplates) }),
            " ",
            t.name
          ] }, t.id)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxs("h4", { style: { marginBottom: "0.5rem", color: "var(--accent-secondary)" }, children: [
            "🏫 Classes (",
            selectedClasses.size,
            ")"
          ] }),
          /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.4rem", maxHeight: "150px", overflowY: "auto" }, children: classesList.map((c) => /* @__PURE__ */ jsxs("label", { className: "toggle-row", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: selectedClasses.has(c.id), onChange: () => toggleSet(selectedClasses, c.id, setSelectedClasses) }),
            " ",
            c.name
          ] }, c.id)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxs("h4", { style: { marginBottom: "0.5rem", color: "var(--accent-secondary)" }, children: [
            "👩‍🏫 Teachers (",
            selectedTeachers.size,
            ")"
          ] }),
          /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.4rem", maxHeight: "150px", overflowY: "auto" }, children: teachersList.map((t) => /* @__PURE__ */ jsxs("label", { className: "toggle-row", children: [
            /* @__PURE__ */ jsx("input", { type: "checkbox", checked: selectedTeachers.has(t.id), onChange: () => toggleSet(selectedTeachers, t.id, setSelectedTeachers) }),
            " ",
            t.name
          ] }, t.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { style: { textAlign: "center" }, children: /* @__PURE__ */ jsx("button", { className: "btn btn-success btn-lg", onClick: handleGenerate, disabled: generating || selectedClasses.size === 0 || selectedDays.size === 0, children: generating ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "spinner" }),
        " Generating..."
      ] }) : "⚡ Run Smart Algorithm" }) }),
      result && /* @__PURE__ */ jsxs("div", { style: { marginTop: "1.5rem", padding: "1rem", borderRadius: "var(--radius-sm)", background: result.success ? "var(--success-bg)" : "var(--danger-bg)", color: result.success ? "var(--success)" : "var(--danger)", fontSize: "0.9rem", textAlign: "center" }, children: [
        result.success ? "✓" : "✕",
        " ",
        result.message
      ] })
    ] })
  ] });
}
function AdminApp() {
  const [adminKey, setAdminKey] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  useEffect(() => {
    const savedKey = localStorage.getItem("adminSecretKey");
    if (savedKey) {
      setAdminKey(savedKey);
      setIsAuthed(true);
    }
  }, []);
  const tabs = [
    { label: "🗓️ Editor", component: /* @__PURE__ */ jsx(TimetableEditor, { adminKey }) },
    { label: "🕐 Time Slots", component: /* @__PURE__ */ jsx(TemplatesTab, { adminKey }) },
    { label: "🏫 Classes", component: /* @__PURE__ */ jsx(ClassesTab, { adminKey }) },
    { label: "👩‍🏫 Teachers", component: /* @__PURE__ */ jsx(TeachersTab, { adminKey }) },
    { label: "⚡ Generate", component: /* @__PURE__ */ jsx(GenerateTab, { adminKey }) }
  ];
  const handleLogin = () => {
    if (keyInput.trim()) {
      const key = keyInput.trim();
      setAdminKey(key);
      setIsAuthed(true);
      localStorage.setItem("adminSecretKey", key);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };
  if (!isAuthed) {
    return /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsxs("div", { className: "login-box card", children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: "3rem", marginBottom: "1rem" }, children: "🔐" }),
      /* @__PURE__ */ jsx("h2", { children: "Admin Access" }),
      /* @__PURE__ */ jsx("p", { children: "Enter the admin secret key to manage timetables." }),
      /* @__PURE__ */ jsx("div", { className: "form-group", children: /* @__PURE__ */ jsx(
        "input",
        {
          className: "form-input",
          type: "password",
          placeholder: "Secret key...",
          value: keyInput,
          onChange: (e) => setKeyInput(e.target.value),
          onKeyDown: handleKeyDown
        }
      ) }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-primary btn-lg", onClick: handleLogin, style: { width: "100%" }, children: "🔓 Unlock Dashboard" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "container page-content", children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "0.5rem", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsx("h1", { style: { fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" }, children: "⚙️ Admin Dashboard" }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-ghost btn-sm", onClick: () => {
        setIsAuthed(false);
        setAdminKey("");
        localStorage.removeItem("adminSecretKey");
      }, children: "🚪 Logout" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "tabs", style: { maxWidth: "100%" }, children: tabs.map((tab, i) => /* @__PURE__ */ jsx("button", { className: `tab-btn ${activeTab === i ? "active" : ""}`, onClick: () => setActiveTab(i), children: tab.label }, i)) }),
    tabs[activeTab].component
  ] });
}

const $$Admin = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Admin \u2014 Timetable Generator" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "AdminApp", AdminApp, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Yamini Warekar/Downloads/time-table-main/time-table-main/src/components/AdminApp", "client:component-export": "default" })} ` })}`;
}, "C:/Users/Yamini Warekar/Downloads/time-table-main/time-table-main/src/pages/admin.astro", void 0);

const $$file = "C:/Users/Yamini Warekar/Downloads/time-table-main/time-table-main/src/pages/admin.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Admin,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
