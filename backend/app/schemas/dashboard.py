from typing import Any, Optional

from pydantic import BaseModel


class DashboardStats(BaseModel):
    overview: dict
    leadsByStatus: list
    dealsByStage: list
    recentLeads: list
    recentDeals: list


class DashboardRecent(BaseModel):
    recentLeads: list
    recentDeals: list
    recentContacts: list
    recentTasks: list
