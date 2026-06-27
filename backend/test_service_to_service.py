import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from soa_lib import request_service

def main():
    print("Testing service-to-service TCP communication...")
    
    # Let's request the report service to calculate KPIs, which internally calls flota and incid services via TCP!
    print("\nCalling repor -> get_kpis via TCP...")
    kpi_resp = request_service("repor", "get_kpis")
    print(f"Response status: {kpi_resp.get('status')}")
    print(f"KPIs returned: {kpi_resp.get('data')}")
    
    assert kpi_resp.get("status") == "ok", "Failed to call repor -> get_kpis"
    
    # Let's request frecu -> get_intervals, which internally calls flota -> get_routes and flota -> get_assignments via TCP!
    print("\nCalling frecu -> get_intervals via TCP...")
    frecu_resp = request_service("frecu", "get_intervals", {"terminal_id": 1})
    print(f"Response status: {frecu_resp.get('status')}")
    print(f"Intervals count: {len(frecu_resp.get('data', []))}")
    
    assert frecu_resp.get("status") == "ok", "Failed to call frecu -> get_intervals"

    # Let's request carga -> get_alerts, which internally calls flota -> get_buses via TCP!
    print("\nCalling carga -> get_alerts via TCP...")
    carga_resp = request_service("carga", "get_alerts", {"terminal_id": 1})
    print(f"Response status: {carga_resp.get('status')}")
    print(f"Alerts count: {len(carga_resp.get('data', []))}")
    
    assert carga_resp.get("status") == "ok", "Failed to call carga -> get_alerts"
    
    print("\nSUCCESS: All service-to-service TCP communication tests passed!")

if __name__ == "__main__":
    main()
