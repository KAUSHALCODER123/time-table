import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

const ADMIN_KEY = import.meta.env.ADMIN_SECRET_KEY || 'admin';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function isAdmin(request: Request): boolean {
    const auth = request.headers.get('authorization');
    return auth === `Bearer ${ADMIN_KEY}`;
}

export const POST: APIRoute = async ({ request }) => {
    if (!isAdmin(request)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const bodyText = await request.text();
        let body: any = {};
        if (bodyText) {
            try { body = JSON.parse(bodyText); } catch (e) { }
        }

        // 1. Fetch classes with templates
        let classQuery = supabase.from('classes').select('*, time_slot_templates(id, name, slots)');
        if (body.class_ids && body.class_ids.length > 0) {
            // @ts-ignore
            classQuery = classQuery.in('id', body.class_ids);
        }
        const { data: classes, error: classErr } = await classQuery;
        if (classErr) throw classErr;

        if (!classes || classes.length === 0) {
            return new Response(JSON.stringify({ error: 'No classes found or selected.' }), { status: 400 });
        }

        // Filter further by selected templates if provided
        let filteredClasses = classes;
        if (body.template_ids && body.template_ids.length > 0) {
            filteredClasses = classes.filter(c => c.template_id && body.template_ids.includes(c.template_id));
        }
        if (filteredClasses.length === 0) {
            return new Response(JSON.stringify({ error: 'Selected templates have no linked classes.' }), { status: 400 });
        }

        // 2. Fetch assignments
        const { data: assignments, error: assignErr } = await supabase
            .from('teacher_slot_assignments')
            .select('teacher_id, template_id, teachers(id, name, subject)');
        if (assignErr) throw assignErr;

        // Build template → allowed teachers map
        const teachersByTemplate: Record<string, Array<{ id: string; name: string; subject: string }>> = {};
        const allowedTeacherIds = new Set(body.teacher_ids || []);

        for (const a of (assignments || [])) {
            if (body.teacher_ids && body.teacher_ids.length > 0 && !allowedTeacherIds.has(a.teacher_id)) continue;

            const tid = a.template_id;
            if (!teachersByTemplate[tid]) teachersByTemplate[tid] = [];
            const t = a.teachers as any;
            if (t) teachersByTemplate[tid].push({ id: t.id, name: t.name, subject: t.subject });
        }

        // 3. Clear existing timetable entries. If filtering, clear ONLY the days/classes we are regenerating.
        const runDays = body.days && body.days.length > 0
            ? body.days
            : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

        let delQuery = supabase.from('timetables').delete().in('day', runDays);
        if (body.class_ids && body.class_ids.length > 0) {
            // @ts-ignore
            delQuery = delQuery.in('class_id', body.class_ids);
        }
        await delQuery;

        // 4. Generate timetable
        const entries: Array<{ class_id: string; day: string; slot_index: number; teacher_id: string }> = [];
        const booked: Record<string, Set<string>> = {};

        function getBookingKey(day: string, slotIndex: number): string {
            return `${day}_${slotIndex}`;
        }

        const teacherLoad: Record<string, number> = {};

        for (const day of runDays) {
            for (const cls of filteredClasses) {
                const template = cls.time_slot_templates as any;
                if (!template) continue;

                const slots = template.slots as Array<{ label: string; start_time: string; end_time: string }>;
                if (!slots || slots.length === 0) continue;

                const availableTeachers = teachersByTemplate[template.id] || [];
                if (availableTeachers.length === 0) continue;

                for (let si = 0; si < slots.length; si++) {
                    const key = getBookingKey(day, si);
                    if (!booked[key]) booked[key] = new Set();

                    const candidates = availableTeachers
                        .filter((t) => !booked[key].has(t.id))
                        .sort((a, b) => (teacherLoad[a.id] || 0) - (teacherLoad[b.id] || 0));

                    if (candidates.length === 0) continue;

                    const chosen = candidates[0];
                    booked[key].add(chosen.id);
                    teacherLoad[chosen.id] = (teacherLoad[chosen.id] || 0) + 1;

                    entries.push({
                        class_id: cls.id,
                        day,
                        slot_index: si,
                        teacher_id: chosen.id,
                    });
                }
            }
        }

        if (entries.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Could not generate timetable. Check if selected teachers are assigned to selected templates.' }),
                { status: 400 }
            );
        }

        for (let i = 0; i < entries.length; i += 500) {
            const batch = entries.slice(i, i + 500);
            const { error: insertErr } = await supabase.from('timetables').insert(batch);
            if (insertErr) throw insertErr;
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: `Generated ${entries.length} entries for ${filteredClasses.length} classes over ${runDays.length} days.`,
                count: entries.length,
            }),
            { status: 200 }
        );
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Generation failed' }), { status: 500 });
    }
};
