import logging
import json
import time
import sys
from functools import wraps
from datetime import datetime

# Configure logging format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] [%(name)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

def get_logger(name):
    """Get a logger instance with the given name."""
    return logging.getLogger(name)

def log_function_call(logger_name=None):
    """
    Decorator to log function inputs, outputs, and execution time.
    
    Usage:
        @log_function_call("MyService")
        def my_function(arg1, arg2):
            return result
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            logger = get_logger(logger_name or func.__module__)
            func_name = func.__name__
            
            # Log input
            try:
                # Safely serialize args and kwargs
                args_repr = _safe_repr(args)
                kwargs_repr = _safe_repr(kwargs)
                logger.info(f"[{func_name}] START - Args: {args_repr}, Kwargs: {kwargs_repr}")
            except Exception as e:
                logger.info(f"[{func_name}] START - (Could not serialize args: {e})")
            
            # Execute function
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                
                # Log output
                try:
                    result_repr = _safe_repr(result)
                    logger.info(f"[{func_name}] SUCCESS - Duration: {duration:.3f}s, Result: {result_repr}")
                except Exception as e:
                    logger.info(f"[{func_name}] SUCCESS - Duration: {duration:.3f}s (Could not serialize result: {e})")
                
                return result
            except Exception as e:
                duration = time.time() - start_time
                logger.error(f"[{func_name}] FAILED - Duration: {duration:.3f}s, Error: {str(e)}", exc_info=True)
                raise
        
        return wrapper
    return decorator

def _safe_repr(obj, max_length=500):
    """Safely represent an object as a string, truncating if too long."""
    try:
        if isinstance(obj, (list, tuple)) and len(obj) > 5:
            # For long lists, show first few items
            repr_str = f"{type(obj).__name__}(length={len(obj)}, first_items={repr(obj[:3])}...)"
        elif isinstance(obj, dict) and len(obj) > 10:
            # For large dicts, show keys only
            repr_str = f"dict(keys={list(obj.keys())[:10]}..., total_keys={len(obj)})"
        else:
            repr_str = repr(obj)
        
        if len(repr_str) > max_length:
            return repr_str[:max_length] + "... (truncated)"
        return repr_str
    except Exception:
        return f"<{type(obj).__name__} object>"

def log_step(logger, step_name, details=None):
    """
    Log a step in a process with optional details.
    
    Args:
        logger: Logger instance
        step_name: Name of the step
        details: Optional dictionary of details to log
    """
    if details:
        try:
            details_str = json.dumps(details, default=str, indent=2)
            logger.info(f"[STEP] {step_name}\n{details_str}")
        except Exception as e:
            logger.info(f"[STEP] {step_name} - {details} (serialization error: {e})")
    else:
        logger.info(f"[STEP] {step_name}")

def log_api_request(logger, method, path, data_summary=None):
    """Log an API request."""
    msg = f"[API REQUEST] {method} {path}"
    if data_summary:
        msg += f" - {json.dumps(data_summary, default=str)}"
    logger.info(msg)

def log_api_response(logger, path, status_code, duration, response_summary=None):
    """Log an API response."""
    msg = f"[API RESPONSE] {path} - Status: {status_code}, Duration: {duration:.3f}s"
    if response_summary:
        msg += f" - {json.dumps(response_summary, default=str)}"
    logger.info(msg)

def log_external_call(logger, service_name, operation, details=None):
    """Log an external service call."""
    msg = f"[EXTERNAL CALL] {service_name}.{operation}"
    if details:
        msg += f" - {json.dumps(details, default=str)}"
    logger.info(msg)

def log_data_processing(logger, operation, input_summary, output_summary):
    """Log data processing operations."""
    logger.info(f"[DATA PROCESSING] {operation}")
    logger.info(f"  Input: {json.dumps(input_summary, default=str)}")
    logger.info(f"  Output: {json.dumps(output_summary, default=str)}")
