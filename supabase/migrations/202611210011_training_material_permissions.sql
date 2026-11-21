-- Enable the administrator-only training material management already enforced by RLS.
grant insert,update,delete on public.rp_training_materials to authenticated;
