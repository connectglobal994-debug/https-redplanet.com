import { hasSupabaseAdminConfig, supabaseAdmin } from '@/lib/supabaseAdmin';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return UUID.test(value);
}

export async function getResearchProjectAccess(projectId: string, userId: string) {
  if (!isUuid(projectId) || !hasSupabaseAdminConfig()) return null;
  const projects = await supabaseAdmin<Record<string, unknown>[]>(
    `research_projects?id=eq.${projectId}&select=id,owner_user_id,title,research_question,status,created_at,updated_at&limit=1`
  );
  const project = projects[0];
  if (!project) return null;
  if (project.owner_user_id === userId) return { project, canEdit: true };
  const memberships = await supabaseAdmin<Record<string, unknown>[]>(
    `research_project_members?project_id=eq.${projectId}&user_id=eq.${userId}&select=member_role&limit=1`
  );
  if (!memberships[0]) return null;
  return { project, canEdit: memberships[0].member_role === 'editor' };
}
