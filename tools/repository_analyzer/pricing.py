from repository_analyzer.config import PRICING_MODELS, DEFAULT_MODEL

def get_pricing_info(model_name):
    """
    Retrieve pricing metadata for the given model name.
    Performs case-insensitive checks and falls back to DEFAULT_MODEL if not found.
    """
    if not model_name:
        model_name = DEFAULT_MODEL
        
    if model_name in PRICING_MODELS:
        return PRICING_MODELS[model_name]
        
    # Case-insensitive lookup
    for name, cfg in PRICING_MODELS.items():
        if name.lower() == model_name.lower():
            return cfg
            
    # Fallback
    return PRICING_MODELS[DEFAULT_MODEL]

def calculate_costs(tokens, model_name):
    """
    Calculate standard reading cost estimates (1x, 5x, 10x).
    """
    cfg = get_pricing_info(model_name)
    input_1m = cfg["input_1m"]
    output_1m = cfg["output_1m"]
    
    cost_1 = (tokens / 1000000.0) * input_1m
    cost_5 = cost_1 * 5.0
    cost_10 = cost_1 * 10.0
    
    return {
        "model_name": cfg["display_name"],
        "input_1m": input_1m,
        "output_1m": output_1m,
        "read_1": cost_1,
        "read_5": cost_5,
        "read_10": cost_10
    }

def calculate_agent_cost(input_tokens, output_tokens, model_name):
    """
    Calculate the total cost of an agent execution based on input and output tokens.
    """
    cfg = get_pricing_info(model_name)
    
    input_cost = (input_tokens / 1000000.0) * cfg["input_1m"]
    output_cost = (output_tokens / 1000000.0) * cfg["output_1m"]
    total_cost = input_cost + output_cost
    
    return {
        "model_name": cfg["display_name"],
        "input_cost": input_cost,
        "output_cost": output_cost,
        "total_cost": total_cost
    }

def calculate_agent_scenarios(tokens, model_name):
    """
    Calculate estimated pricing scenarios for different types of agent tasks:
    - Explorer Agent (Input: 100% repository, Output: 10% repository)
    - Developer Agent (Input: 200% repository, Output: 50% repository)
    - Autonomous Agent (Input: 500% repository, Output: 100% repository)
    """
    cfg = get_pricing_info(model_name)
    input_1m = cfg["input_1m"]
    output_1m = cfg["output_1m"]
    
    explorer = {
        'input': tokens * 1.0,
        'output': tokens * 0.1,
    }
    developer = {
        'input': tokens * 2.0,
        'output': tokens * 0.5,
    }
    autonomous = {
        'input': tokens * 5.0,
        'output': tokens * 1.0,
    }
    
    def get_cost(scenario):
        incost = (scenario['input'] / 1000000.0) * input_1m
        outcost = (scenario['output'] / 1000000.0) * output_1m
        return incost + outcost
        
    return {
        "explorer": {
            "input": explorer['input'],
            "output": explorer['output'],
            "cost": get_cost(explorer)
        },
        "developer": {
            "input": developer['input'],
            "output": developer['output'],
            "cost": get_cost(developer)
        },
        "autonomous": {
            "input": autonomous['input'],
            "output": autonomous['output'],
            "cost": get_cost(autonomous)
        }
    }
