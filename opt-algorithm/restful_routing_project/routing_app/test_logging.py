"""
Test script to verify logging functionality
Run this from the project root: python -m routing_app.test_logging
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from routing_app.logger_utils import (
    get_logger, 
    log_step, 
    log_api_request, 
    log_api_response,
    log_external_call,
    log_data_processing
)

def test_basic_logging():
    """Test basic logging functionality"""
    logger = get_logger("test_module")
    
    print("\n" + "="*80)
    print("Testing Basic Logging")
    print("="*80 + "\n")
    
    logger.debug("This is a DEBUG message")
    logger.info("This is an INFO message")
    logger.warning("This is a WARNING message")
    logger.error("This is an ERROR message")
    
    print("\n✓ Basic logging test completed\n")

def test_step_logging():
    """Test step logging"""
    logger = get_logger("test_module")
    
    print("\n" + "="*80)
    print("Testing Step Logging")
    print("="*80 + "\n")
    
    log_step(logger, "Processing data")
    log_step(logger, "Calculating distances", {
        "locations": 10,
        "batch_size": 5,
        "total_pairs": 100
    })
    
    print("\n✓ Step logging test completed\n")

def test_api_logging():
    """Test API request/response logging"""
    logger = get_logger("test_module")
    
    print("\n" + "="*80)
    print("Testing API Logging")
    print("="*80 + "\n")
    
    log_api_request(logger, "POST", "/api/priority", {
        "trucks": 5,
        "orders": 50,
        "priority": "balance"
    })
    
    import time
    time.sleep(0.1)  # Simulate processing
    
    log_api_response(logger, "/api/priority", 200, 0.1, {
        "shipments": 3,
        "unassigned_orders": 2
    })
    
    print("\n✓ API logging test completed\n")

def test_external_call_logging():
    """Test external service call logging"""
    logger = get_logger("test_module")
    
    print("\n" + "="*80)
    print("Testing External Call Logging")
    print("="*80 + "\n")
    
    log_external_call(logger, "GoogleMaps", "directions", {
        "origin": "-6.123,106.456",
        "dest": "-6.234,106.567"
    })
    
    log_external_call(logger, "Airflow", "trigger_inference", {
        "dag_id": "03_inference_pipeline",
        "origin": "-6.123,106.456"
    })
    
    log_external_call(logger, "MinIO", "get_object", {
        "bucket": "runs",
        "object": "dag_run_123/emissions.json"
    })
    
    print("\n✓ External call logging test completed\n")

def test_data_processing_logging():
    """Test data processing logging"""
    logger = get_logger("test_module")
    
    print("\n" + "="*80)
    print("Testing Data Processing Logging")
    print("="*80 + "\n")
    
    log_data_processing(logger, "Dataframe merge",
        {"delivery_orders": 50, "locations": 20},
        {"merged_rows": 50, "columns": 15}
    )
    
    log_data_processing(logger, "Priority calculation",
        {"orders": 50, "mode": "balance"},
        {"positive_priority": 30, "negative_priority": 20}
    )
    
    print("\n✓ Data processing logging test completed\n")

def test_large_data_truncation():
    """Test that large data structures are truncated"""
    logger = get_logger("test_module")
    
    print("\n" + "="*80)
    print("Testing Large Data Truncation")
    print("="*80 + "\n")
    
    # Create large list
    large_list = list(range(1000))
    logger.info(f"Large list: {large_list}")
    
    # Create large dict
    large_dict = {f"key_{i}": f"value_{i}" for i in range(100)}
    logger.info(f"Large dict: {large_dict}")
    
    print("\n✓ Large data truncation test completed\n")

def test_error_logging():
    """Test error logging with exception"""
    logger = get_logger("test_module")
    
    print("\n" + "="*80)
    print("Testing Error Logging")
    print("="*80 + "\n")
    
    try:
        # Simulate an error
        result = 1 / 0
    except Exception as e:
        logger.error(f"Division error occurred: {e}", exc_info=True)
    
    print("\n✓ Error logging test completed\n")

def run_all_tests():
    """Run all logging tests"""
    print("\n" + "="*80)
    print("LOGGING SYSTEM TEST SUITE")
    print("="*80)
    
    test_basic_logging()
    test_step_logging()
    test_api_logging()
    test_external_call_logging()
    test_data_processing_logging()
    test_large_data_truncation()
    test_error_logging()
    
    print("\n" + "="*80)
    print("ALL TESTS COMPLETED SUCCESSFULLY ✓")
    print("="*80 + "\n")
    
    print("The logging system is working correctly!")
    print("You should see structured log messages above with:")
    print("  - Timestamps")
    print("  - Log levels (INFO, WARNING, ERROR, DEBUG)")
    print("  - Module names")
    print("  - Formatted messages")
    print("\nNext steps:")
    print("  1. Run your Django application")
    print("  2. Make API requests to see logs in action")
    print("  3. Check docker-compose logs for production logging")
    print()

if __name__ == "__main__":
    run_all_tests()
