import sys

# Flag to check if tiktoken is available
HAS_TIKTOKEN = False
_encoder = None
_warned_fallback = False

try:
    import tiktoken
    HAS_TIKTOKEN = True
except ImportError:
    HAS_TIKTOKEN = False

def get_encoder(encoding_name="o200k_base"):
    """
    Get the tiktoken encoder, caching it globally.
    """
    global _encoder, HAS_TIKTOKEN
    if not HAS_TIKTOKEN:
        return None
        
    if _encoder is None:
        try:
            _encoder = tiktoken.get_encoding(encoding_name)
        except Exception as e:
            # Fallback to cl100k_base if custom encoding fails
            try:
                _encoder = tiktoken.get_encoding("cl100k_base")
            except Exception:
                HAS_TIKTOKEN = False
                return None
    return _encoder

def count_tokens(text, encoding_name="o200k_base"):
    """
    Count the number of tokens in the given text.
    If tiktoken is installed, this does an exact count.
    Otherwise, it falls back to a high-quality character-based estimation
    (typically ~4 characters per token).
    """
    global _warned_fallback
    
    encoder = get_encoder(encoding_name)
    if encoder is not None:
        try:
            return len(encoder.encode(text, disallowed_special=()))
        except Exception:
            # If tiktoken fails for some reason (e.g. invalid bytes), fall back
            pass
            
    # Fallback estimation: ~4 characters per token as a standard rule of thumb.
    # We also clamp to a minimum of 0 tokens if the text is empty.
    if not HAS_TIKTOKEN and not _warned_fallback:
        print("\n[WARNING] 'tiktoken' library is not available. Using character-ratio fallback (approx. 4 chars/token).", file=sys.stderr)
        print("To get precise token counts, run: pip install tiktoken\n", file=sys.stderr)
        _warned_fallback = True
        
    if not text:
        return 0
        
    return max(1, len(text) // 4)
