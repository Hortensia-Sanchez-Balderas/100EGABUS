
/*
  # Crear usuarios de demostración en auth.users

  Inserta usuarios de demostración directamente en la tabla auth.users
  para permitir el acceso inicial al sistema 100EGABUS.
*/

DO $$
BEGIN
  -- Solo insertar si no existen
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@100egabus.mx') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'admin@100egabus.mx',
      crypt('admin123456', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"nombre":"Carlos Mendoza","rol":"administrador"}',
      now(),
      now(),
      'authenticated',
      'authenticated'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'operador@100egabus.mx') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'operador@100egabus.mx',
      crypt('operador123456', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"nombre":"Laura Torres","rol":"operador"}',
      now(),
      now(),
      'authenticated',
      'authenticated'
    );
  END IF;
END $$;
