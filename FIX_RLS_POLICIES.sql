-- =====================================================
-- FIX: Politicas RLS - Ejecutar esto en Supabase
-- =====================================================
-- Este script limpia y recrea las políticas RLS
-- Ejecutarlo en: SQL Editor de Supabase
-- =====================================================

-- PASO 1: Deshabilitar RLS temporalmente
ALTER TABLE palets DISABLE ROW LEVEL SECURITY;
ALTER TABLE paquetes DISABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria DISABLE ROW LEVEL SECURITY;

-- PASO 2: Eliminar todas las políticas existentes conflictivas
DROP POLICY IF EXISTS "palets_select" ON palets;
DROP POLICY IF EXISTS "palets_insert" ON palets;
DROP POLICY IF EXISTS "palets_update" ON palets;
DROP POLICY IF EXISTS "palets_delete" ON palets;
DROP POLICY IF EXISTS "palets_todas_operaciones" ON palets;
DROP POLICY IF EXISTS "palets_insertar" ON palets;
DROP POLICY IF EXISTS "palets_actualizar" ON palets;
DROP POLICY IF EXISTS "palets_eliminar" ON palets;

DROP POLICY IF EXISTS "paquetes_select" ON paquetes;
DROP POLICY IF EXISTS "paquetes_insert" ON paquetes;
DROP POLICY IF EXISTS "paquetes_update" ON paquetes;
DROP POLICY IF EXISTS "paquetes_delete" ON paquetes;
DROP POLICY IF EXISTS "paquetes_todas_operaciones" ON paquetes;
DROP POLICY IF EXISTS "paquetes_insertar" ON paquetes;
DROP POLICY IF EXISTS "paquetes_actualizar" ON paquetes;
DROP POLICY IF EXISTS "paquetes_eliminar" ON paquetes;

DROP POLICY IF EXISTS "auditoria_select" ON auditoria;
DROP POLICY IF EXISTS "auditoria_insert" ON auditoria;
DROP POLICY IF EXISTS "auditoria_todas_operaciones" ON auditoria;
DROP POLICY IF EXISTS "auditoria_insertar" ON auditoria;

-- PASO 3: Habilitar RLS nuevamente
ALTER TABLE palets ENABLE ROW LEVEL SECURITY;
ALTER TABLE paquetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

-- PASO 4: Crear nuevas políticas permisivas y simples
-- ====== PALETS ======
CREATE POLICY "palets_select" ON palets 
  FOR SELECT 
  USING (true);

CREATE POLICY "palets_insert" ON palets 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "palets_update" ON palets 
  FOR UPDATE 
  USING (true);

CREATE POLICY "palets_delete" ON palets 
  FOR DELETE 
  USING (true);

-- ====== PAQUETES ======
CREATE POLICY "paquetes_select" ON paquetes 
  FOR SELECT 
  USING (true);

CREATE POLICY "paquetes_insert" ON paquetes 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "paquetes_update" ON paquetes 
  FOR UPDATE 
  USING (true);

CREATE POLICY "paquetes_delete" ON paquetes 
  FOR DELETE 
  USING (true);

-- ====== AUDITORIA ======
CREATE POLICY "auditoria_select" ON auditoria 
  FOR SELECT 
  USING (true);

CREATE POLICY "auditoria_insert" ON auditoria 
  FOR INSERT 
  WITH CHECK (true);

-- Confirmación
SELECT 'Politicas RLS reconfigu radas exitosamente ✅' as resultado;
