-- Habilitar extensión vectorial pgvector si no está activa
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Crear Tipo ENUM para Entidades de Embeddings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'embedding_entity_type') THEN
    CREATE TYPE embedding_entity_type AS ENUM (
      'PRODUCT', 'STORE', 'CATEGORY', 'PROMOTION', 'FAQ',
      'ORDER', 'CUSTOMER', 'COUPON', 'BLOG', 'MENU', 'REVIEW', 'DOCUMENT'
    );
  END IF;
END$$;

-- 2. Crear Tabla Genérica de Embeddings
CREATE TABLE IF NOT EXISTS "Embedding" (
  "id" TEXT PRIMARY KEY,
  "entityType" embedding_entity_type NOT NULL,
  "entityId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,          -- 'openai', 'voyage', 'cohere'
  "model" TEXT NOT NULL,             -- 'text-embedding-3-small'
  "embedding" vector(1536) NOT NULL,
  "contentHash" TEXT NOT NULL,        -- SHA-256
  "version" INT DEFAULT 1,            -- Versión del procesamiento del contexto
  "metadata" JSONB DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Crear Tabla de Observabilidad y Métricas (AgentExecution)
CREATE TABLE IF NOT EXISTS "AgentExecution" (
  "id" TEXT PRIMARY KEY,
  "traceId" TEXT NOT NULL,            -- Trace ID único de la conversación/petición
  "providerRequestId" TEXT,           -- Request ID retornado por el API del LLM/Embedding
  "agentName" TEXT NOT NULL,
  "selectedTool" TEXT,
  "model" TEXT NOT NULL,              -- Modelo utilizado ('gpt-4o', etc.)
  "promptVersion" TEXT DEFAULT 'v1',  -- Versión del prompt utilizado
  "vectorLatencyMs" INT,
  "llmLatencyMs" INT,
  "promptTokens" INT,
  "completionTokens" INT,
  "estimatedCost" DOUBLE PRECISION,
  "status" TEXT NOT NULL,             -- 'success', 'error'
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Índices B-Tree
CREATE INDEX IF NOT EXISTS idx_embedding_entity_type ON "Embedding"("entityType");
CREATE INDEX IF NOT EXISTS idx_embedding_entity_id ON "Embedding"("entityId");
CREATE INDEX IF NOT EXISTS idx_embedding_metadata ON "Embedding" USING gin ("metadata");
CREATE INDEX IF NOT EXISTS idx_agent_execution_trace ON "AgentExecution"("traceId");

-- 5. Índice Vectorial HNSW
CREATE INDEX IF NOT EXISTS idx_embedding_vector_hnsw 
ON "Embedding" 
USING hnsw (embedding vector_cosine_ops);

-- 6. Función de Búsqueda Vectorial Híbrida con Similitud Mínima
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding vector(1536),
  match_count INT,
  filter_entity_type embedding_entity_type,
  filter_metadata JSONB DEFAULT '{}'::jsonb,
  minimum_similarity DOUBLE PRECISION DEFAULT 0.75
)
RETURNS TABLE (
  "entityId" TEXT,
  "similarity" DOUBLE PRECISION
) 
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e."entityId",
    1 - (e."embedding" <=> query_embedding) AS similarity
  FROM "Embedding" e
  WHERE e."entityType" = filter_entity_type
    AND (1 - (e."embedding" <=> query_embedding)) >= minimum_similarity
    AND (filter_metadata = '{}'::jsonb OR e."metadata" @> filter_metadata)
  ORDER BY e."embedding" <=> query_embedding
  LIMIT match_count;
END;
$$;
