import { supabase } from './supabaseClient';

/**
 * Logs a user action to the audit_logs table.
 * @param {string} action - Short summary of the action (e.g., "Deleted Course").
 * @param {string} details - Detailed description (e.g., "Deleted course 'AI-101'").
 * @param {string} type - Type of log: 'info', 'warning', 'error'.
 */
export const logActivity = async (action, details, type = 'info') => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        // If no user, it might be a system action or guest. Use 'System' or 'Guest'.
        // But RLS requires authenticated user for insert. If 'guest', it might fail unless we allow public insert (bad idea).
        // We will assume most logging happens when logged in.

        if (!user) {
            console.warn("Attempted to log activity without authenticated user:", action);
            return;
        }

        // Get simpler username if available from metadata, else email
        const username = user.user_metadata?.name || user.email || 'Unknown User';

        const { error } = await supabase.from('audit_logs').insert([
            {
                username,
                action,
                details,
                type,
                // date and id are auto-generated
            }
        ]);

        if (error) {
            console.error("Failed to write to audit log:", error);
        }
    } catch (err) {
        console.error("Unexpected error in logActivity:", err);
    }
};
