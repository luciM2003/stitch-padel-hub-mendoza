-- handle_new_user() solo debe ejecutarse como parte del trigger on_auth_user_created,
-- nunca invocado directamente vía /rest/v1/rpc/handle_new_user por un cliente.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
