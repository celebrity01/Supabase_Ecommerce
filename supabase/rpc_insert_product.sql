-- RPC function: insert product and upload log with daily limit enforcement
-- Usage: call rpc_insert_product(seller_uuid, product_image_url, product_details, price, shop_location, shop_name, owner_number)
create or replace function public.rpc_insert_product(
  p_seller_id uuid,
  p_product_image text,
  p_product_details text,
  p_price numeric,
  p_shop_location text,
  p_shop_name text,
  p_owner_number text
) returns uuid
 language plpgsql
as $$
declare
  v_limit int;
  v_count int;
  v_product_id uuid;
begin
  select daily_upload_limit into v_limit from public.sellers where id = p_seller_id;
  if v_limit is null then
    raise exception 'Seller not found or limit not set';
  end if;

  select count(*) into v_count
    from public.upload_logs ul
    join public.products p on p.id = ul.product_id
    where ul.seller_id = p_seller_id
      and ul.upload_date = current_date;

  if v_count >= v_limit then
    raise exception 'Daily upload limit reached';
  end if;

  -- Insert product
  insert into public.products(
    id,
    seller_id,
    product_image,
    product_details,
    price,
    shop_location,
    shop_name,
    owner_number,
    created_at
  ) values (
    gen_random_uuid(),
    p_seller_id,
    p_product_image,
    p_product_details,
    p_price,
    p_shop_location,
    p_shop_name,
    p_owner_number,
    now()
  )
  returning id into v_product_id;

  -- Insert upload log
  insert into public.upload_logs(
    id,
    seller_id,
    product_id,
    upload_date,
    created_at
  ) values (
    gen_random_uuid(),
    p_seller_id,
    v_product_id,
    current_date,
    now()
  );

  return v_product_id;
end;
$$;