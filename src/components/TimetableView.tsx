import React, { useState, useEffect, useCallback, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface TimetableEntry {
    id: string;
    class_id: string;
    day: string;
    slot_index: number;
    teacher_id: string;
    classes: { name: string; template_id: string };
    teachers: { name: string; subject: string };
}

interface Template {
    id: string;
    name: string;
    slots: Array<{ label: string; start_time: string; end_time: string }>;
}

interface ClassItem {
    id: string;
    name: string;
    template_id: string | null;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetableView() {
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [viewMode, setViewMode] = useState<'class' | 'day'>('class');
    const [selectedDay, setSelectedDay] = useState<string>(DAYS[0]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const timetableRef = useRef<HTMLDivElement>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [ttRes, clsRes, tplRes] = await Promise.all([
                fetch('/api/timetable'),
                fetch('/api/classes'),
                fetch('/api/templates'),
            ]);
            const [tt, cls, tpl] = await Promise.all([ttRes.json(), clsRes.json(), tplRes.json()]);
            setEntries(Array.isArray(tt) ? tt : []);
            setClasses(Array.isArray(cls) ? cls : []);
            setTemplates(Array.isArray(tpl) ? tpl : []);
            // Auto-select first class
            if (Array.isArray(cls) && cls.length > 0 && !selectedClass) {
                setSelectedClass(cls[0].id);
            }
        } catch (e) {
            console.error('Failed to load timetable', e);
        }
        setLoading(false);
    }, [selectedClass]);

    useEffect(() => { load(); }, [load]);

    // Build lookup for Class-wise view
    const filteredEntries = entries.filter((e) => e.class_id === selectedClass);
    const selectedClassObj = classes.find((c) => c.id === selectedClass);
    const classTemplate = templates.find((t) => t.id === selectedClassObj?.template_id);
    const classSlots = classTemplate?.slots || [];

    const classLookup: Record<string, TimetableEntry> = {};
    for (const e of filteredEntries) {
        classLookup[`${e.day}_${e.slot_index}`] = e;
    }

    // Build lookup for Day-wise view
    const dayEntries = entries.filter((e) => e.day === selectedDay);
    const dayLookup: Record<string, TimetableEntry> = {}; // classId_slotIndex -> entry
    for (const e of dayEntries) {
        dayLookup[`${e.class_id}_${e.slot_index}`] = e;
    }

    // For day-wise view, we need a common set of columns. 
    // We'll use the maximum number of slots from any template used by the classes.
    const maxSlots = Math.max(...templates.map(t => t.slots?.length || 0), 0);
    const columnIndices = Array.from({ length: maxSlots }, (_, i) => i);

    const handleDownloadPDF = async () => {
        if (!timetableRef.current) return;
        setDownloading(true);

        try {
            const element = timetableRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#000000',
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'l' : 'p',
                unit: 'px',
                format: [canvas.width / 2, canvas.height / 2]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
            const fileName = viewMode === 'class'
                ? `Timetable-${selectedClassObj?.name.replace(/\s+/g, '-')}`
                : `Timetable-${selectedDay}`;
            pdf.save(`${fileName}.pdf`);
        } catch (error) {
            console.error('PDF Generation failed:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <span className="spinner" /> Loading timetable...
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <div className="empty-state fade-in">
                <div className="icon">📅</div>
                <p>No timetable has been generated yet.</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Ask your admin to generate a timetable from the admin dashboard.
                </p>
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* ── Toolbar Card ── */}
            <div className="tv-toolbar">
                <div className="tv-toolbar-left">
                    <div className="tv-toggle">
                        <button
                            className={`tv-toggle-btn ${viewMode === 'class' ? 'active' : ''}`}
                            onClick={() => setViewMode('class')}
                        >
                            🏫 By Class
                        </button>
                        <button
                            className={`tv-toggle-btn ${viewMode === 'day' ? 'active' : ''}`}
                            onClick={() => setViewMode('day')}
                        >
                            📅 By Day
                        </button>
                    </div>

                    {viewMode === 'class' ? (
                        <div className="tv-selector-group">
                            <select
                                className="form-select tv-select"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                            >
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {classTemplate && (
                                <span className="badge badge-purple">🕐 {classTemplate.name}</span>
                            )}
                        </div>
                    ) : (
                        <div className="tv-selector-group">
                            <select
                                className="form-select tv-select"
                                value={selectedDay}
                                onChange={(e) => setSelectedDay(e.target.value)}
                            >
                                {DAYS.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleDownloadPDF}
                    disabled={downloading || (viewMode === 'class' && classSlots.length === 0)}
                >
                    {downloading ? (
                        <><span className="spinner" /> Generating...</>
                    ) : (
                        <>📥 PDF</>
                    )}
                </button>
            </div>

            {/* ── Class-wise View ── */}
            {viewMode === 'class' ? (
                classSlots.length === 0 ? (
                    <div className="empty-state">
                        <p>No time slots found for this class template.</p>
                    </div>
                ) : (
                    <div className="timetable-wrapper" ref={timetableRef}>
                        <div className="tv-table-inner">
                            <h2 className="tv-table-title">
                                {selectedClassObj?.name} — Weekly Schedule
                            </h2>
                            <table className="timetable tv-table">
                                <thead>
                                    <tr>
                                        <th className="tv-th-corner">Day</th>
                                        {classSlots.map((s, i) => (
                                            <th key={i}>
                                                <div className="tv-th-label">{s.label}</div>
                                                <div className="tv-th-time">
                                                    {s.start_time} – {s.end_time}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {DAYS.map((day) => (
                                        <tr key={day}>
                                            <th className="tv-day-cell">{day}</th>
                                            {classSlots.map((_, si) => {
                                                const entry = classLookup[`${day}_${si}`];
                                                return (
                                                    <td key={si} className={entry ? 'tv-filled' : 'tv-empty'}>
                                                        {entry ? (
                                                            <div className="tv-chip">
                                                                <span className="tv-chip-name">{entry.teachers?.name || '—'}</span>
                                                                {entry.teachers?.subject && (
                                                                    <span className="tv-chip-subject">{entry.teachers.subject}</span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="tv-dash">—</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            ) : (
                /* ── Day-wise View ── */
                <div className="timetable-wrapper" ref={timetableRef}>
                    <div className="tv-table-inner">
                        <h2 className="tv-table-title">
                            {selectedDay} — All Classes
                        </h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="timetable tv-table">
                                <thead>
                                    <tr>
                                        <th className="tv-th-corner">Class</th>
                                        {columnIndices.map(i => {
                                            // Find the first template that has this slot to show time
                                            const anyTpl = templates.find(t => t.slots && t.slots[i]);
                                            const slotInfo = anyTpl?.slots?.[i];
                                            return (
                                                <th key={i}>
                                                    <div className="tv-th-label">P{i + 1}</div>
                                                    {slotInfo && (
                                                        <div className="tv-th-time">{slotInfo.start_time} – {slotInfo.end_time}</div>
                                                    )}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {classes.map((c) => {
                                        const t = templates.find(tpl => tpl.id === c.template_id);
                                        return (
                                            <tr key={c.id}>
                                                <th className="tv-day-cell">{c.name}</th>
                                                {columnIndices.map(si => {
                                                    const entry = dayLookup[`${c.id}_${si}`];
                                                    const slotInfo = t?.slots?.[si];
                                                    const isOutOfRange = !slotInfo;
                                                    return (
                                                        <td key={si} className={isOutOfRange ? 'tv-na' : entry ? 'tv-filled' : 'tv-empty'}>
                                                            {isOutOfRange ? (
                                                                <span className="tv-dash-na">—</span>
                                                            ) : entry ? (
                                                                <div className="tv-chip">
                                                                    <span className="tv-chip-name">{entry.teachers?.name || '—'}</span>
                                                                    {entry.teachers?.subject && (
                                                                        <span className="tv-chip-subject">{entry.teachers.subject}</span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="tv-dash">—</span>
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
                    </div>
                </div>
            )}

            <style>{`
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
            `}</style>
        </div>
    );
}
