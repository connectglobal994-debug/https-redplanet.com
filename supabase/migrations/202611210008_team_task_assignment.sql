-- Managers must be able to assign work to another team member.
drop policy if exists rp_tasks_insert_self on public.rp_tasks;
create policy rp_tasks_insert_self_or_admin on public.rp_tasks for insert to authenticated
with check(
 (assignee_id=(select auth.uid()) and created_by=(select auth.uid()))
 or (created_by=(select auth.uid()) and public.has_redplanet_role(array['administrator']))
);
