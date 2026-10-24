-- =====================================================================
-- One True · Lista de lanzamiento (página de Próximamente)
-- Proyecto Supabase: rtaflovadzoanspemxbh
-- Cómo aplicarlo: Supabase > SQL Editor > pegar todo > Run. Se puede correr varias veces.
--
-- Seguridad: la tabla tiene RLS sin políticas, así que la llave publicable (anon)
-- no puede leer ni escribir. Solo el Worker de Cloudflare, con la llave secreta
-- (service_role), llama a las funciones de abajo.
-- =====================================================================

create table if not exists public.launch_leads (
  id          bigint generated always as identity primary key,   -- también es el puesto en la fila
  name        text check (char_length(name) <= 80),
  email       text unique check (email is null or (char_length(email) <= 254 and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]{2,}$')),
  phone       text unique check (phone is null or phone ~ '^\+[0-9]{8,15}$'),   -- E.164: +573001234567
  consent_at  timestamptz not null,                                -- autorización de datos (Ley 1581 de 2012)
  source      text check (char_length(source) <= 60),              -- ?ref= o utm_source del enlace
  utm         jsonb,
  ip_hash     text,                                                -- SHA-256 de la IP (no se guarda la IP)
  user_agent  text check (char_length(user_agent) <= 300),
  created_at  timestamptz not null default now(),
  constraint launch_leads_contact check (email is not null or phone is not null)
);

comment on table public.launch_leads is 'Personas que dejaron WhatsApp y/o correo en la página de Próximamente.';

create index if not exists launch_leads_ip_time on public.launch_leads (ip_hash, created_at);

alter table public.launch_leads enable row level security;
revoke all on public.launch_leads from anon, authenticated;

-- ---------------------------------------------------------------------
-- Registro: valida, limita 5 por IP cada 10 min, no duplica y devuelve el puesto.
-- Errores (los traduce el Worker): 'contact', 'rate'.
-- ---------------------------------------------------------------------
create or replace function public.join_launch_list(
  p_name text,
  p_email text,
  p_phone text,
  p_source text default null,
  p_utm jsonb default null,
  p_ip_hash text default null,
  p_user_agent text default null
)
returns table (queue_position bigint, already boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
  v_recent int;
begin
  if p_email is null and p_phone is null then
    raise exception 'contact' using errcode = 'P0001';
  end if;

  if p_ip_hash is not null then
    select count(*) into v_recent
    from launch_leads
    where ip_hash = p_ip_hash and created_at > now() - interval '10 minutes';
    if v_recent >= 5 then
      raise exception 'rate' using errcode = 'P0001';
    end if;
  end if;

  -- ¿Ya estaba? Se completa el dato que faltaba y se devuelve su mismo puesto
  select id into v_id
  from launch_leads
  where (p_email is not null and email = p_email) or (p_phone is not null and phone = p_phone)
  order by id
  limit 1;

  if v_id is not null then
    begin
      update launch_leads
      set email = coalesce(email, p_email),
          phone = coalesce(phone, p_phone),
          name  = coalesce(name, p_name)
      where id = v_id;
    exception when unique_violation then
      null; -- el dato nuevo ya pertenece a otra persona: se deja como estaba
    end;
    return query select v_id, true;
    return;
  end if;

  begin
    insert into launch_leads (name, email, phone, consent_at, source, utm, ip_hash, user_agent)
    values (p_name, p_email, p_phone, now(), p_source, p_utm, p_ip_hash, p_user_agent)
    returning id into v_id;
  exception when unique_violation then
    -- dos registros simultáneos con el mismo dato
    select id into v_id from launch_leads where email = p_email or phone = p_phone order by id limit 1;
    return query select v_id, true;
    return;
  end;

  return query select v_id, false;
end;
$$;

-- Cuántos van en la fila (para el contador de la página)
create or replace function public.launch_list_count()
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select count(*) from launch_leads;
$$;

-- Solo el Worker (service_role) puede ejecutarlas
revoke all on function public.join_launch_list(text, text, text, text, jsonb, text, text) from public, anon, authenticated;
revoke all on function public.launch_list_count() from public, anon, authenticated;
grant execute on function public.join_launch_list(text, text, text, text, jsonb, text, text) to service_role;
grant execute on function public.launch_list_count() to service_role;

-- Que PostgREST vea las funciones nuevas de inmediato
notify pgrst, 'reload schema';
