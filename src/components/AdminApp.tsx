import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import TimetableEditor from './TimetableEditor';

// Types
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
    time_slot_templates?: { name: string } | null;
}

interface TeacherAssignment {
    template_id: string;
    time_slot_templates?: { name: string } | null;
}

interface Teacher {
    id: string;
    name: string;
    subject: string;
    teacher_slot_assignments?: TeacherAssignment[];
}

// Toast helper
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className={`toast toast-${type}`}>
            {type === 'success' ? '✓' : '✕'} {message}
        </div>
    );
}

// ─── API helpers ────────────────────────────────────────────
function apiHeaders(adminKey: string) {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminKey}`,
    };
}

async function apiFetch<T>(url: string, adminKey: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        ...options,
        headers: { ...apiHeaders(adminKey), ...(options?.headers || {}) },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data as T;
}

// ─── Templates Tab ──────────────────────────────────────────
function TemplatesTab({ adminKey }: { adminKey: string }) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [slots, setSlots] = useState<Slot[]>([{ label: 'Period 1', start_time: '08:00', end_time: '08:45' }]);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await apiFetch<Template[]>('/api/templates', adminKey);
            setTemplates(data);
        } catch { }
        if (!silent) setLoading(false);
    }, [adminKey]);

    useEffect(() => { load(); }, [load]);

    const addSlot = () => {
        const n = slots.length + 1;
        setSlots([...slots, { label: `Period ${n}`, start_time: '', end_time: '' }]);
    };

    const removeSlot = (i: number) => setSlots(slots.filter((_, idx) => idx !== i));

    const updateSlot = (i: number, field: keyof Slot, value: string) => {
        const updated = [...slots];
        updated[i] = { ...updated[i], [field]: value };
        setSlots(updated);
    };

    const handleCreateOrUpdate = async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            if (editingId) {
                await apiFetch('/api/templates', adminKey, {
                    method: 'PUT',
                    body: JSON.stringify({ id: editingId, name, slots }),
                });
                setToast({ msg: `Template "${name}" updated!`, type: 'success' });
            } else {
                await apiFetch('/api/templates', adminKey, {
                    method: 'POST',
                    body: JSON.stringify({ name, slots }),
                });
                setToast({ msg: `Template "${name}" created!`, type: 'success' });
            }
            handleCancel();
            load(true);
        } catch (e: any) {
            setToast({ msg: e.message, type: 'error' });
        }
        setSaving(false);
    };

    const handleEdit = (t: Template) => {
        setEditingId(t.id);
        setName(t.name);
        setSlots(t.slots || [{ label: 'Period 1', start_time: '08:00', end_time: '08:45' }]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingId(null);
        setName('');
        setSlots([{ label: 'Period 1', start_time: '08:00', end_time: '08:45' }]);
    };

    const handleDelete = async (id: string, tplName: string) => {
        if (!confirm(`Delete template "${tplName}"?`)) return;
        try {
            await apiFetch(`/api/templates?id=${id}`, adminKey, { method: 'DELETE' });
            setToast({ msg: 'Template deleted', type: 'success' });
            if (editingId === id) handleCancel();
            load(true);
        } catch (e: any) {
            setToast({ msg: e.message, type: 'error' });
        }
    };

    return (
        <div className="fade-in">
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            <div className={`card ${editingId ? 'editing-pulse' : ''}`} style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                    <span className="card-title">{editingId ? '✏️ Edit Time Slot Template' : '➕ Create Time Slot Template'}</span>
                    {editingId && <button className="btn btn-ghost btn-sm" onClick={handleCancel}>Cancel</button>}
                </div>
                <div className="form-group">
                    <label className="form-label">Template Name</label>
                    <input className="form-input" placeholder="e.g. Morning Session, Afternoon Session"
                        value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <label className="form-label">Lecture Periods</label>
                <div className="slot-list">
                    {slots.map((s, i) => (
                        <div key={i} className="slot-item">
                            <input className="form-input" style={{ maxWidth: 120 }} placeholder="Label"
                                value={s.label} onChange={(e) => updateSlot(i, 'label', e.target.value)} />
                            <input className="form-input" type="time" style={{ maxWidth: 130 }}
                                value={s.start_time} onChange={(e) => updateSlot(i, 'start_time', e.target.value)} />
                            <span style={{ color: 'var(--text-muted)' }}>→</span>
                            <input className="form-input" type="time" style={{ maxWidth: 130 }}
                                value={s.end_time} onChange={(e) => updateSlot(i, 'end_time', e.target.value)} />
                            {slots.length > 1 && (
                                <button className="btn btn-danger btn-sm" onClick={() => removeSlot(i)}>✕</button>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={addSlot}>+ Add Period</button>
                    <button className="btn btn-primary" onClick={handleCreateOrUpdate} disabled={saving || !name.trim()}>
                        {saving ? <><span className="spinner" /> Saving...</> : (editingId ? '💾 Update Template' : '💾 Save Template')}
                    </button>
                </div>
            </div>

            <h3 className="section-title">📋 Existing Templates</h3>
            {loading ? (
                <div className="loading-overlay"><span className="spinner" /> Loading templates...</div>
            ) : templates.length === 0 ? (
                <div className="empty-state"><div className="icon">🕐</div><p>No templates yet. Create one above!</p></div>
            ) : (
                <div className="card-grid">
                    {templates.map((t) => (
                        <div key={t.id} className={`card ${editingId === t.id ? 'active-border' : ''}`}>
                            <div className="card-header">
                                <span className="card-title">{t.name}</span>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(t)}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id, t.name)}>Delete</button>
                                </div>
                            </div>
                            <span className="badge badge-purple">{t.slots?.length || 0} periods</span>
                            {t.slots && t.slots.length > 0 && (
                                <div className="slot-list">
                                    {t.slots.map((s, i) => (
                                        <div key={i} className="slot-item">
                                            <span className="slot-label">{s.label}</span>
                                            <span className="slot-time">{s.start_time} → {s.end_time}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Classes Tab ────────────────────────────────────────────
function ClassesTab({ adminKey }: { adminKey: string }) {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [templateId, setTemplateId] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [c, t] = await Promise.all([
                apiFetch<ClassItem[]>('/api/classes', adminKey),
                apiFetch<Template[]>('/api/templates', adminKey),
            ]);
            setClasses(c);
            setTemplates(t);
        } catch { }
        if (!silent) setLoading(false);
    }, [adminKey]);

    useEffect(() => { load(); }, [load]);

    const handleCreateOrUpdate = async () => {
        if (!name.trim() || !templateId) return;
        setSaving(true);
        try {
            if (editingId) {
                await apiFetch('/api/classes', adminKey, {
                    method: 'PUT',
                    body: JSON.stringify({ id: editingId, name, template_id: templateId }),
                });
                setToast({ msg: `Class "${name}" updated!`, type: 'success' });
            } else {
                await apiFetch('/api/classes', adminKey, {
                    method: 'POST',
                    body: JSON.stringify({ name, template_id: templateId }),
                });
                setToast({ msg: `Class "${name}" added!`, type: 'success' });
            }
            handleCancel();
            load(true);
        } catch (e: any) {
            setToast({ msg: e.message, type: 'error' });
        }
        setSaving(false);
    };

    const handleEdit = (c: ClassItem) => {
        setEditingId(c.id);
        setName(c.name);
        setTemplateId(c.template_id || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingId(null);
        setName('');
        setTemplateId('');
    };

    const handleDelete = async (id: string, clsName: string) => {
        if (!confirm(`Delete class "${clsName}"?`)) return;
        try {
            await apiFetch(`/api/classes?id=${id}`, adminKey, { method: 'DELETE' });
            setToast({ msg: 'Class deleted', type: 'success' });
            if (editingId === id) handleCancel();
            load(true);
        } catch (e: any) {
            setToast({ msg: e.message, type: 'error' });
        }
    };

    return (
        <div className="fade-in">
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            <div className={`card ${editingId ? 'editing-pulse' : ''}`} style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                    <span className="card-title">{editingId ? '✏️ Edit Class' : '➕ Add Class'}</span>
                    {editingId && <button className="btn btn-ghost btn-sm" onClick={handleCancel}>Cancel</button>}
                </div>
                <div className="form-inline">
                    <div className="form-group">
                        <label className="form-label">Class Name</label>
                        <input className="form-input" placeholder="e.g. 1st Std, 4th Std"
                            value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Time Slot Template</label>
                        <select className="form-select" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                            <option value="">Select template...</option>
                            {templates.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <button className="btn btn-primary" onClick={handleCreateOrUpdate} disabled={saving || !name.trim() || !templateId}>
                        {saving ? <><span className="spinner" /> Saving...</> : (editingId ? '💾 Update' : '➕ Add')}
                    </button>
                </div>
            </div>

            <h3 className="section-title">🏫 Classes</h3>
            {loading ? (
                <div className="loading-overlay"><span className="spinner" /> Loading...</div>
            ) : classes.length === 0 ? (
                <div className="empty-state"><div className="icon">🏫</div><p>No classes added yet.</p></div>
            ) : (
                <div className="card-grid">
                    {classes.map((c) => (
                        <div key={c.id} className={`card ${editingId === c.id ? 'active-border' : ''}`}>
                            <div className="card-header">
                                <span className="card-title">{c.name}</span>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(c)}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id, c.name)}>Delete</button>
                                </div>
                            </div>
                            {c.time_slot_templates && (
                                <span className="badge badge-purple">📅 {(c.time_slot_templates as any).name}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Teachers Tab ───────────────────────────────────────────
function TeachersTab({ adminKey }: { adminKey: string }) {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [t, tpl] = await Promise.all([
                apiFetch<Teacher[]>('/api/teachers', adminKey),
                apiFetch<Template[]>('/api/templates', adminKey),
            ]);
            setTeachers(t);
            setTemplates(tpl);
        } catch { }
        if (!silent) setLoading(false);
    }, [adminKey]);

    useEffect(() => { load(); }, [load]);

    const handleCreateOrUpdate = async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            if (editingId) {
                await apiFetch('/api/teachers', adminKey, {
                    method: 'PUT',
                    body: JSON.stringify({ id: editingId, name, subject }),
                });
                setToast({ msg: `Teacher "${name}" updated!`, type: 'success' });
            } else {
                await apiFetch('/api/teachers', adminKey, {
                    method: 'POST',
                    body: JSON.stringify({ name, subject }),
                });
                setToast({ msg: `Teacher "${name}" added!`, type: 'success' });
            }
            handleCancel();
            load(true);
        } catch (e: any) {
            setToast({ msg: e.message, type: 'error' });
        }
        setSaving(false);
    };

    const handleEdit = (t: Teacher) => {
        setEditingId(t.id);
        setName(t.name);
        setSubject(t.subject);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingId(null);
        setName('');
        setSubject('');
    };

    const handleDelete = async (id: string, tName: string) => {
        if (!confirm(`Delete teacher "${tName}"?`)) return;
        try {
            await apiFetch(`/api/teachers?id=${id}`, adminKey, { method: 'DELETE' });
            setToast({ msg: 'Teacher removed', type: 'success' });
            if (editingId === id) handleCancel();
            load(true);
        } catch (e: any) {
            setToast({ msg: e.message, type: 'error' });
        }
    };

    const handleAssign = async (teacherId: string, templateId: string) => {
        try {
            await apiFetch('/api/teacher-assignments', adminKey, {
                method: 'POST',
                body: JSON.stringify({ teacher_id: teacherId, template_id: templateId }),
            });
            setToast({ msg: 'Teacher assigned to template!', type: 'success' });
            load(true);
        } catch (e: any) {
            setToast({ msg: e.message, type: 'error' });
        }
    };

    const handleUnassign = async (teacherId: string, templateId: string) => {
        try {
            await apiFetch(`/api/teacher-assignments?teacher_id=${teacherId}&template_id=${templateId}`, adminKey, {
                method: 'DELETE',
            });
            setToast({ msg: 'Assignment removed', type: 'success' });
            load(true);
        } catch (e: any) {
            setToast({ msg: e.message, type: 'error' });
        }
    };

    const getAssignedTemplateIds = (teacher: Teacher): Set<string> => {
        const set = new Set<string>();
        (teacher.teacher_slot_assignments || []).forEach((a) => set.add(a.template_id));
        return set;
    };

    return (
        <div className="fade-in">
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            <div className={`card ${editingId ? 'editing-pulse' : ''}`} style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                    <span className="card-title">{editingId ? '✏️ Edit Teacher' : '➕ Add Teacher'}</span>
                    {editingId && <button className="btn btn-ghost btn-sm" onClick={handleCancel}>Cancel</button>}
                </div>
                <div className="form-inline">
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input className="form-input" placeholder="Teacher name"
                            value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Subject</label>
                        <input className="form-input" placeholder="e.g. Math, English"
                            value={subject} onChange={(e) => setSubject(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" onClick={handleCreateOrUpdate} disabled={saving || !name.trim()}>
                        {saving ? <><span className="spinner" /> Saving...</> : (editingId ? '💾 Update' : '➕ Add')}
                    </button>
                </div>
            </div>

            <h3 className="section-title">👩‍🏫 Teachers</h3>
            {loading ? (
                <div className="loading-overlay"><span className="spinner" /> Loading...</div>
            ) : teachers.length === 0 ? (
                <div className="empty-state"><div className="icon">👩‍🏫</div><p>No teachers added yet.</p></div>
            ) : (
                <div className="card-grid">
                    {teachers.map((t) => {
                        const assignedIds = getAssignedTemplateIds(t);
                        return (
                            <div key={t.id} className={`card ${editingId === t.id ? 'active-border' : ''}`}>
                                <div className="card-header">
                                    <span className="card-title">{t.name}</span>
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(t)}>Edit</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id, t.name)}>Delete</button>
                                    </div>
                                </div>
                                {t.subject && <span className="badge badge-yellow" style={{ marginBottom: '0.75rem' }}>📚 {t.subject}</span>}

                                <label className="form-label" style={{ marginTop: '0.5rem' }}>Assigned Templates</label>
                                <div className="assign-row">
                                    {templates.map((tpl) => {
                                        const isAssigned = assignedIds.has(tpl.id);
                                        return (
                                            <label key={tpl.id} className="toggle-row" title={isAssigned ? 'Click to unassign' : 'Click to assign'}>
                                                <input type="checkbox" checked={isAssigned}
                                                    onChange={() => isAssigned ? handleUnassign(t.id, tpl.id) : handleAssign(t.id, tpl.id)} />
                                                {tpl.name}
                                            </label>
                                        );
                                    })}
                                    {templates.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Create templates first</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── Generate Tab ───────────────────────────────────────────
function GenerateTab({ adminKey }: { adminKey: string }) {
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const [classesList, setClassesList] = useState<any[]>([]);
    const [teachersList, setTeachersList] = useState<any[]>([]);
    const [templatesList, setTemplatesList] = useState<any[]>([]);

    const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());
    const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(new Set());
    const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());

    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']));

    useEffect(() => {
        Promise.all([
            apiFetch<any[]>('/api/classes', adminKey),
            apiFetch<any[]>('/api/teachers', adminKey),
            apiFetch<any[]>('/api/templates', adminKey),
        ]).then(([c, t, tpl]) => {
            setClassesList(c);
            setTeachersList(t);
            setTemplatesList(tpl);
            setSelectedClasses(new Set(c.map((x) => x.id)));
            setSelectedTeachers(new Set(t.map((x) => x.id)));
            setSelectedTemplates(new Set(tpl.map((x) => x.id)));
        }).catch(() => { });
    }, [adminKey]);

    const toggleSet = (set: Set<string>, val: string, updater: React.Dispatch<React.SetStateAction<Set<string>>>) => {
        const nextSet = new Set(set);
        if (nextSet.has(val)) nextSet.delete(val);
        else nextSet.add(val);
        updater(nextSet);
    };

    const handleGenerate = async () => {
        if (!confirm('This will overwrite timetables for the selected targets. Continue?')) return;
        setGenerating(true);
        setResult(null);
        try {
            const data = await apiFetch<{ success: boolean; message: string; count?: number }>('/api/generate', adminKey, {
                method: 'POST',
                body: JSON.stringify({
                    class_ids: Array.from(selectedClasses),
                    template_ids: Array.from(selectedTemplates),
                    teacher_ids: Array.from(selectedTeachers),
                    days: Array.from(selectedDays)
                })
            });
            setResult(data);
            setToast({ msg: data.message, type: 'success' });
        } catch (e: any) {
            setResult({ success: false, message: e.message });
            setToast({ msg: e.message, type: 'error' });
        }
        setGenerating(false);
    };

    return (
        <div className="fade-in">
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>🪄</div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Selective Auto-Generation</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4, marginTop: '0.3rem' }}>Choose targets carefully. Unselected items will be excluded.</p>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="form-group">
                        <h4 style={{ marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>🗓️ Days ({selectedDays.size})</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '150px', overflowY: 'auto' }}>
                            {allDays.map(d => (
                                <label key={d} className="toggle-row">
                                    <input type="checkbox" checked={selectedDays.has(d)} onChange={() => toggleSet(selectedDays, d, setSelectedDays)} /> {d}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <h4 style={{ marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>🕒 Templates ({selectedTemplates.size})</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '150px', overflowY: 'auto' }}>
                            {templatesList.map(t => (
                                <label key={t.id} className="toggle-row">
                                    <input type="checkbox" checked={selectedTemplates.has(t.id)} onChange={() => toggleSet(selectedTemplates, t.id, setSelectedTemplates)} /> {t.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <h4 style={{ marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>🏫 Classes ({selectedClasses.size})</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '150px', overflowY: 'auto' }}>
                            {classesList.map(c => (
                                <label key={c.id} className="toggle-row">
                                    <input type="checkbox" checked={selectedClasses.has(c.id)} onChange={() => toggleSet(selectedClasses, c.id, setSelectedClasses)} /> {c.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <h4 style={{ marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>👩‍🏫 Teachers ({selectedTeachers.size})</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '150px', overflowY: 'auto' }}>
                            {teachersList.map(t => (
                                <label key={t.id} className="toggle-row">
                                    <input type="checkbox" checked={selectedTeachers.has(t.id)} onChange={() => toggleSet(selectedTeachers, t.id, setSelectedTeachers)} /> {t.name}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button className="btn btn-success btn-lg" onClick={handleGenerate} disabled={generating || selectedClasses.size === 0 || selectedDays.size === 0}>
                        {generating ? <><span className="spinner" /> Generating...</> : '⚡ Run Smart Algorithm'}
                    </button>
                </div>

                {result && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-sm)', background: result.success ? 'var(--success-bg)' : 'var(--danger-bg)', color: result.success ? 'var(--success)' : 'var(--danger)', fontSize: '0.9rem', textAlign: 'center' }}>
                        {result.success ? '✓' : '✕'} {result.message}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Admin App ─────────────────────────────────────────
export default function AdminApp() {
    const [adminKey, setAdminKey] = useState('');
    const [isAuthed, setIsAuthed] = useState(false);
    const [keyInput, setKeyInput] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const savedKey = localStorage.getItem('adminSecretKey');
        if (savedKey) {
            setAdminKey(savedKey);
            setIsAuthed(true);
        }
    }, []);

    const tabs = [
        { label: '🗓️ Editor', component: <TimetableEditor adminKey={adminKey} /> },
        { label: '🕐 Time Slots', component: <TemplatesTab adminKey={adminKey} /> },
        { label: '🏫 Classes', component: <ClassesTab adminKey={adminKey} /> },
        { label: '👩‍🏫 Teachers', component: <TeachersTab adminKey={adminKey} /> },
        { label: '⚡ Generate', component: <GenerateTab adminKey={adminKey} /> },
    ];

    const handleLogin = () => {
        if (keyInput.trim()) {
            const key = keyInput.trim();
            setAdminKey(key);
            setIsAuthed(true);
            localStorage.setItem('adminSecretKey', key);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleLogin();
    };

    if (!isAuthed) {
        return (
            <div className="container">
                <div className="login-box card">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
                    <h2>Admin Access</h2>
                    <p>Enter the admin secret key to manage timetables.</p>
                    <div className="form-group">
                        <input className="form-input" type="password" placeholder="Secret key..."
                            value={keyInput} onChange={(e) => setKeyInput(e.target.value)} onKeyDown={handleKeyDown} />
                    </div>
                    <button className="btn btn-primary btn-lg" onClick={handleLogin} style={{ width: '100%' }}>
                        🔓 Unlock Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container page-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>⚙️ Admin Dashboard</h1>
                <button className="btn btn-ghost btn-sm" onClick={() => { setIsAuthed(false); setAdminKey(''); localStorage.removeItem('adminSecretKey'); }}>
                    🚪 Logout
                </button>
            </div>

            <div className="tabs" style={{ maxWidth: '100%' }}>
                {tabs.map((tab, i) => (
                    <button key={i} className={`tab-btn ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {tabs[activeTab].component}
        </div>
    );
}
