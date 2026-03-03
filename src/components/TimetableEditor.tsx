import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Slot {
    label: string;
    start_time: string;
    end_time: string;
}

interface Template {
    id: string;
    name: string;
    slots: Slot[];
}

interface ClassItem {
    id: string;
    name: string;
    template_id: string | null;
}

interface Teacher {
    id: string;
    name: string;
    subject: string;
}

interface TimetableEntry {
    id: string;
    class_id: string;
    day: string;
    slot_index: number;
    teacher_id: string;
    teachers?: { name: string; subject: string };
}

interface Props {
    adminKey: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetableEditor({ adminKey }: Props) {
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [viewMode, setViewMode] = useState<'class' | 'day'>('class');
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedDay, setSelectedDay] = useState<string>('Monday');

    const [draggedTeacher, setDraggedTeacher] = useState<Teacher | null>(null);

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [ttRes, clsRes, teaRes, tplRes] = await Promise.all([
                fetch('/api/timetable'),
                fetch('/api/classes'),
                fetch('/api/teachers'),
                fetch('/api/templates'),
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
            console.error('Failed to load data', e);
        }
        if (!silent) setLoading(false);
    }, [selectedClass]);

    useEffect(() => { load(); }, [load]);

    const handleUpdateEntry = async (classId: string, day: string, slotIndex: number, teacherId: string | null) => {
        setSaving(true);
        try {
            if (teacherId === null) {
                // Delete
                const res = await fetch(`/api/timetable?class_id=${classId}&day=${day}&slot_index=${slotIndex}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${adminKey}` }
                });
                if (!res.ok) throw new Error('Delete failed');
            } else {
                // Upsert
                const res = await fetch('/api/timetable', {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${adminKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ class_id: classId, day, slot_index: slotIndex, teacher_id: teacherId })
                });
                if (!res.ok) throw new Error('Update failed');
            }
            await load(true); // Reload to get fresh data silently
        } catch (e: any) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    // Lookup: day_slotIndex_classId -> entry
    const lookup: Record<string, TimetableEntry> = {};
    for (const e of entries) {
        lookup[`${e.day}_${e.slot_index}_${e.class_id}`] = e;
    }

    // Identify conflicts (teacher assigned to multiple slots in same period)
    const conflicts = new Set<string>();
    const teacherSlots: Record<string, string[]> = {}; // "day_slotIndex_teacherId" -> [classId1, classId2]
    for (const e of entries) {
        const key = `${e.day}_${e.slot_index}_${e.teacher_id}`;
        if (!teacherSlots[key]) teacherSlots[key] = [];
        teacherSlots[key].push(e.class_id);
    }
    for (const key in teacherSlots) {
        if (teacherSlots[key].length > 1) {
            teacherSlots[key].forEach(classId => {
                const parts = key.split('_');
                conflicts.add(`${parts[0]}_${parts[1]}_${classId}`);
            });
        }
    }

    const onTeacherDragStart = (teacher: Teacher) => {
        setDraggedTeacher(teacher);
    };

    const onDropOnSlot = (classId: string, day: string, slotIndex: number) => {
        if (!draggedTeacher) return;

        // Check if this teacher is already assigned to another class at the same day & slot
        const conflictingEntry = entries.find(
            (e) => e.teacher_id === draggedTeacher.id
                && e.day === day
                && e.slot_index === slotIndex
                && e.class_id !== classId
        );

        if (conflictingEntry) {
            const conflictClass = classes.find(c => c.id === conflictingEntry.class_id);
            const confirmed = window.confirm(
                `⚠️ Scheduling Conflict!\n\n` +
                `${draggedTeacher.name} is already assigned to "${conflictClass?.name || 'another class'}" ` +
                `on ${day} during Period ${slotIndex + 1}.\n\n` +
                `Assigning them here will create a double-booking.\n\n` +
                `Do you want to proceed anyway?`
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
        const cls = classes.find(c => c.id === selectedClass);
        const tpl = templates.find(t => t.id === cls?.template_id);
        const slots = tpl?.slots || [];

        if (!cls) return <div className="empty-state">Select a class</div>;
        if (slots.length === 0) return <div className="empty-state">No slots defined for this class template</div>;

        return (
            <div className="timetable-wrapper">
                <table className="timetable editable">
                    <thead>
                        <tr>
                            <th>Day / Period</th>
                            {slots.map((s, i) => (
                                <th key={i}>
                                    <div>{s.label}</div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{s.start_time}-{s.end_time}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {DAYS.map(day => (
                            <tr key={day}>
                                <th>{day}</th>
                                {slots.map((_, si) => {
                                    const entry = lookup[`${day}_${si}_${selectedClass}`];
                                    const hasConflict = conflicts.has(`${day}_${si}_${selectedClass}`);
                                    return (
                                        <td
                                            key={si}
                                            className={`slot-cell ${hasConflict ? 'conflict' : ''}`}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={() => onDropOnSlot(selectedClass, day, si)}
                                        >
                                            {selectedClass && (
                                                <>
                                                    {entry ? (
                                                        <div className="assignment-box">
                                                            <div className="teacher-name">{entry.teachers?.name || '—'}</div>
                                                            <div className="teacher-subject">{entry.teachers?.subject}</div>
                                                            <button
                                                                className="remove-btn"
                                                                onClick={() => handleUpdateEntry(selectedClass, day, si, null)}
                                                                title="Remove assignment"
                                                            >×</button>
                                                        </div>
                                                    ) : (
                                                        <div className="empty-slot">Drop here</div>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const maxSlots = Math.max(...templates.map(t => t.slots?.length || 0), 0);
    const editorColumnIndices = Array.from({ length: maxSlots }, (_, i) => i);

    const renderDayWise = () => {
        return (
            <div className="timetable-wrapper">
                <table className="timetable editable">
                    <thead>
                        <tr>
                            <th>Class</th>
                            {editorColumnIndices.map(i => {
                                const anyTpl = templates.find(t => t.slots && t.slots[i]);
                                const slotInfo = anyTpl?.slots?.[i];
                                return (
                                    <th key={i}>
                                        <div>{slotInfo?.label || `P${i + 1}`}</div>
                                        {slotInfo && (
                                            <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{slotInfo.start_time}-{slotInfo.end_time}</div>
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map(cls => {
                            const tpl = templates.find(t => t.id === cls.template_id);
                            const slots = tpl?.slots || [];
                            return (
                                <tr key={cls.id}>
                                    <th>{cls.name}</th>
                                    {editorColumnIndices.map(si => {
                                        if (si >= slots.length) return <td key={si} className="locked-cell">—</td>;

                                        const entry = lookup[`${selectedDay}_${si}_${cls.id}`];
                                        const hasConflict = conflicts.has(`${selectedDay}_${si}_${cls.id}`);
                                        return (
                                            <td
                                                key={si}
                                                className={`slot-cell ${hasConflict ? 'conflict' : ''}`}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={() => onDropOnSlot(cls.id, selectedDay, si)}
                                            >
                                                {entry ? (
                                                    <div className="assignment-box">
                                                        <div className="teacher-name">{entry.teachers?.name || '—'}</div>
                                                        <div className="teacher-subject">{entry.teachers?.subject}</div>
                                                        <button
                                                            className="remove-btn"
                                                            onClick={() => handleUpdateEntry(cls.id, selectedDay, si, null)}
                                                        >×</button>
                                                    </div>
                                                ) : (
                                                    <div className="empty-slot">+</div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    if (loading) return <div className="loading-overlay"><span className="spinner" /> Loading Editor...</div>;

    return (
        <div className="editor-container fade-in">
            <div className="editor-layout">
                {/* Left Sidebar: Teachers */}
                <div className="editor-sidebar">
                    <h3 className="section-title">👨‍🏫 Teachers</h3>
                    <p className="hint text-muted">Drag a teacher to an empty slot</p>
                    <div className="teacher-drag-list">
                        {teachers.map(t => (
                            <div
                                key={t.id}
                                className="draggable-teacher card"
                                draggable
                                onDragStart={() => onTeacherDragStart(t)}
                            >
                                <div className="teacher-name">{t.name}</div>
                                <div className="teacher-subject">{t.subject}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content: Timetable */}
                <div className="editor-main">
                    <div className="editor-header nav-row">
                        <div className="view-toggle">
                            <button
                                className={`ed-toggle-btn ${viewMode === 'class' ? 'active' : ''}`}
                                onClick={() => setViewMode('class')}
                            >📅 Day View</button>
                            <button
                                className={`ed-toggle-btn ${viewMode === 'day' ? 'active' : ''}`}
                                onClick={() => setViewMode('day')}
                            >🏫 Class View</button>
                        </div>

                        {viewMode === 'class' ? (
                            <div className="filter-item">
                                <label>Select Class:</label>
                                <select
                                    className="form-select"
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    style={{ minWidth: '150px' }}
                                >
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        ) : (
                            <div className="filter-item">
                                <label>Select Day:</label>
                                <select
                                    className="form-select"
                                    value={selectedDay}
                                    onChange={(e) => setSelectedDay(e.target.value)}
                                    style={{ minWidth: '150px' }}
                                >
                                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        )}

                        {saving && <span className="saving-indicator"><span className="spinner" /> Saving...</span>}
                    </div>

                    {viewMode === 'class' ? renderClassWise() : renderDayWise()}
                </div>
            </div>

            <style>{`
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
            `}</style>
        </div>
    );
}
