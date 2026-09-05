"""
Safeguard & Circuit Breaker API Router:
Monitors live circuit breaker state, switches operational modes,
handles Chief Risk Officer manual overrides, and exposes full audit trail.
"""
from __future__ import annotations
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from controls.circuit_breaker import GLOBAL_CIRCUIT_BREAKER
from controls.audit_log import GLOBAL_AUDIT_LOG

router = APIRouter(prefix="/api/safeguard", tags=["Autonomous Controls"])

class ModeToggleRequest(BaseModel):
    mode: str = Field(..., description="'auto' | 'manual'")

class OverrideRequest(BaseModel):
    officer_id: str = Field(default="CRO-AUTH-01")
    reason: str = Field(default="Market conditions stabilized. Authorizing resume of operations.")

@router.get("/status")
async def get_safeguard_status():
    return {
        "status": GLOBAL_CIRCUIT_BREAKER.status,
        "mode": GLOBAL_CIRCUIT_BREAKER.mode,
        "last_action": GLOBAL_CIRCUIT_BREAKER.last_action,
        "last_evaluated": GLOBAL_CIRCUIT_BREAKER.last_evaluated,
        "active_weights": GLOBAL_CIRCUIT_BREAKER.active_weights,
        "thresholds": {
            "risk_budget_cvar_99": GLOBAL_CIRCUIT_BREAKER.risk_budget_cvar,
            "amber_cvar_threshold": round(GLOBAL_CIRCUIT_BREAKER.risk_budget_cvar * 1.2, 4),
            "red_cvar_threshold": round(GLOBAL_CIRCUIT_BREAKER.risk_budget_cvar * 1.5, 4),
            "max_drawdown_limit": GLOBAL_CIRCUIT_BREAKER.max_drawdown,
            "critical_drawdown_limit": GLOBAL_CIRCUIT_BREAKER.critical_drawdown,
            "min_liquidity_ratio": GLOBAL_CIRCUIT_BREAKER.min_liquidity
        }
    }

@router.post("/toggle")
async def toggle_safeguard_mode(request: ModeToggleRequest):
    if request.mode not in ["auto", "manual"]:
        raise HTTPException(status_code=400, detail="Mode must be 'auto' or 'manual'")
    return GLOBAL_CIRCUIT_BREAKER.set_mode(request.mode)

@router.post("/reset")
async def reset_circuit_breaker(request: OverrideRequest):
    return GLOBAL_CIRCUIT_BREAKER.manual_override(officer_id=request.officer_id, reason=request.reason)

@router.get("/audit-log")
async def get_audit_log(limit: int = 100):
    entries = GLOBAL_AUDIT_LOG.get_entries(limit=limit)
    return {
        "count": len(entries),
        "entries": entries
    }
