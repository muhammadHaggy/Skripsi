import sys
import os
import unittest
from unittest.mock import patch, MagicMock
import pandas as pd
import numpy as np

# Setup Django environment
sys.path.append('/Users/Acer/Documents/Skripsi/opt-algorithm/restful_routing_project')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restful_routing_project.settings')
import django
try:
    django.setup()
except Exception as e:
    print(f"Django setup failed: {e}")

from routing_app.helper import get_distance_runner
from routing_app.views import calculate_emission_priority

class TestEmissionIntegration(unittest.TestCase):

    @patch('routing_app.helper.trigger_inference')
    @patch('routing_app.helper.poll_dag_run')
    @patch('routing_app.helper.get_inference_result')
    def test_get_distance_runner_with_emission(self, mock_get_result, mock_poll, mock_trigger):
        # Setup Mocks
        mock_trigger.return_value = "manual__test_run_id"
        mock_poll.return_value = "success"
        mock_get_result.return_value = {"emission_total": 5.5}

        # Input Data
        locations = pd.DataFrame([
            {'latitude': -6.1, 'longitude': 106.7}, # Loc A
            {'latitude': -6.2, 'longitude': 106.8}  # Loc B
        ])

        # Execute
        distances, times, emissions = get_distance_runner(locations)

        # Verify
        self.assertEqual(len(emissions), 2)
        self.assertEqual(len(emissions[0]), 2)
        
        # Check emission value for A -> B (index 0 -> 1)
        # We expect 5.5 because that's what our mock returns
        self.assertEqual(emissions[0][1], 5.5)
        
        # Verify calls
        # Should trigger inference for A->B and B->A (2 calls)
        self.assertEqual(mock_trigger.call_count, 2) 

    def test_emission_priority(self):
        row_close = {'distance_from_origin': 0.1, 'relative_position': '+'}
        row_far = {'distance_from_origin': 0.9, 'relative_position': '+'}
        
        p_close = calculate_emission_priority(row_close)
        p_far = calculate_emission_priority(row_far)
        
        print(f"Priority Close: {p_close}, Priority Far: {p_far}")
        self.assertTrue(p_close > p_far, "Closer location should have higher priority")

if __name__ == '__main__':
    unittest.main()
