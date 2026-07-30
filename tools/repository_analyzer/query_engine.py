import os
import json
import re

def query_semantic_context(query, base_dir):
    """
    Parses a natural language query, maps it to concepts, crawls the knowledge graph,
    and returns a structured context recommendation (Intent, Entities, Files, Excludes, Tokens, Confidence).
    """
    knowledge_path = os.path.join(base_dir, '.repository-ai', 'knowledge.json')
    context_map_path = os.path.join(base_dir, '.repository-ai', 'context-map.json')
    
    # Defaults in case metadata is missing
    empty_result = {
        "intent": "Genérico",
        "entities": [],
        "files": [],
        "excludes": [],
        "tokens": 0,
        "confidence": 50
    }
    
    if not os.path.exists(knowledge_path) or not os.path.exists(context_map_path):
        return empty_result
        
    try:
        with open(knowledge_path, 'r', encoding='utf-8') as f:
            graph = json.load(f)
        with open(context_map_path, 'r', encoding='utf-8') as f:
            context_map = json.load(f)
    except Exception:
        return empty_result

    query_lower = query.lower()
    
    # 1. Concept Mapping (Intent and target keywords)
    intent = "Mantenimiento General"
    entities = []
    keywords = []
    
    # Auth concept
    if any(term in query_lower for term in ['auth', 'login', 'oauth', 'token', 'user', 'session', 'clerk', 'perfil']):
        intent = "Autenticación / Seguridad"
        entities = ["Authentication", "Session Tokens", "Users & Identity", "Middleware Guard"]
        keywords = ['auth', 'user', 'session', 'clerk', 'profile', 'token', 'middleware']
        
    # Payments concept
    elif any(term in query_lower for term in ['stripe', 'payment', 'pago', 'mercadopago', 'checkout', 'factura', 'invoice', 'druo']):
        intent = "Pasarelas de Pago & Checkout"
        entities = ["Payments Integration", "Stripe / Mercado Pago Clients", "Invoicing", "Orders Model"]
        keywords = ['stripe', 'payment', 'pago', 'mercadopago', 'checkout', 'invoice', 'druo', 'order', 'prisma']
        
    # WhatsApp / Bot concept
    elif any(term in query_lower for term in ['whatsapp', 'bot', 'chatbot', 'message', 'mensajería', 'evolution']):
        intent = "Mensajería & Chatbot Conversacional"
        entities = ["WhatsApp Cloud API", "Chatbot State Logic", "Evolution API Integration", "Message Processor"]
        keywords = ['whatsapp', 'bot', 'chatbot', 'message', 'evolution', 'waClient']
        
    else:
        # Fallback keyword extraction from query
        entities = ["Símbolos de Negocio Relacionados"]
        keywords = [w for w in re.findall(r'\b\w{4,}\b', query_lower) if w not in ['para', 'sobre', 'como', 'desde', 'hacer', 'crear', 'agregar', 'implementar']]

    # 2. Walk Knowledge Graph nodes to match symbols
    matched_files = set()
    matched_symbols = []
    
    for node in graph.get('nodes', []):
        node_id = node.get('id', '')
        node_type = node.get('type', '')
        
        # Check if node name matches keywords
        node_id_lower = node_id.lower()
        if any(kw in node_id_lower for kw in keywords):
            if node_type == 'file':
                matched_files.add(node_id)
            elif node_type == 'symbol':
                file_path = node.get('file')
                if file_path:
                    matched_files.add(file_path)
                    matched_symbols.append(node_id)

    # 3. Follow CALLS edges in Call Graph (1 level deep) to add execution context
    extended_files = set(matched_files)
    for edge in graph.get('edges', []):
        src = edge.get('source', '')
        tgt = edge.get('target', '')
        rel = edge.get('type', '')
        
        if rel == 'CALLS':
            # If caller is matched, add callee's file
            if src in matched_symbols:
                callee_file = tgt.split('#')[0]
                if callee_file:
                    extended_files.add(callee_file)
            # If callee is matched, add caller's file
            if tgt in matched_symbols:
                caller_file = src.split('#')[0]
                if caller_file:
                    extended_files.add(caller_file)

    # Exclude non-matching files (Noise reduction)
    excludes = []
    # Giant / unrelated files in context_map
    for f in context_map.keys():
        if f not in extended_files:
            # Add up to 3 unrelated files to the list of excludes to show noise reduction
            if len(excludes) < 3:
                # Prioritize excluding files that belong to other concepts
                if 'auth' in intent.lower() and ('whatsapp' in f.lower() or 'stripe' in f.lower()):
                    excludes.append(f)
                elif 'pago' in intent.lower() and ('bot' in f.lower() or 'sitemap' in f.lower()):
                    excludes.append(f)
                elif 'whatsapp' in intent.lower() and ('stripe' in f.lower() or 'prisma.ts' in f.lower()):
                    excludes.append(f)
                    
    # Fill excludes with default if empty
    if not excludes:
        for f in context_map.keys():
            if f not in extended_files and len(excludes) < 3:
                excludes.append(f)

    # 4. Calculate total estimated tokens
    total_tokens = 0
    recommended_files = list(extended_files)[:10] # limit to top 10 files for context relevance
    for f in recommended_files:
        total_tokens += context_map.get(f, {}).get('tokens', 1000)
        
    # Calculate confidence based on matches
    confidence = 70 + min(len(matched_symbols) * 4, 25)
    
    return {
        "intent": intent,
        "entities": entities,
        "files": recommended_files,
        "excludes": excludes,
        "tokens": total_tokens,
        "confidence": confidence
    }
