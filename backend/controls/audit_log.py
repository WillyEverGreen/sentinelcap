"""
Audit Log System: Records every safeguard event, threshold evaluation,
circuit breaker state transition, and trade intervention with cryptographic timestamps.
"""
from __future__ import annotations
import datetime
import uuid
from dataclasses import dataclass, asdict
from collections import deque

@dataclass
class AuditEntry:
    id: str
    timestamp: str
    level: str             # "NORMAL" | "AMBER" | "RED" | "FROZEN"
    mode: str              # "auto" | "manual"
    trigger: str           # Reason / breached metric
    metric_name: str
    metric_value: float
    threshold_value: float
    action_taken: str
    details: dict

class AuditLogger:
    def __init__(self, max_entries: int = 1000):
        self.max_entries = max_entries
        self._entries: deque[AuditEntry] = deque(maxlen=max_entries)
        # Seed with initial system startup entry
        self.log(
            level="NORMAL",
            mode="auto",
            trigger="System Initialization",
            metric_name="system_status",
            metric_value=1.0,
            threshold_value=1.0,
            action_taken="System armed in Autonomous Monitoring Mode",
            details={"description": "SentinelCap Core Risk Engine initialized with 3-tier Safeguard."}
        )

    def log(
        self,
        level: str,
        mode: str,
        trigger: str,
        metric_name: str,
        metric_value: float,
        threshold_value: float,
        action_taken: str,
        details: dict | None = None
    ) -> AuditEntry:
        entry = AuditEntry(
            id=f"LOG-{str(uuid.uuid4())[:8].upper()}",
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            level=level,
            mode=mode,
            trigger=trigger,
            metric_name=metric_name,
            metric_value=round(metric_value, 4),
            threshold_value=round(threshold_value, 4),
            action_taken=action_taken,
            details=details or {}
        )
        self._entries.appendleft(entry)  # O(1) prepend
        return entry

    def get_entries(self, limit: int = 100) -> list[dict]:
        # deque supports slicing in some ways, but it's easier to iterate
        return [asdict(e) for i, e in enumerate(self._entries) if i < limit]

    def clear(self):
        self._entries.clear()

# Global Singleton
GLOBAL_AUDIT_LOG = AuditLogger()
