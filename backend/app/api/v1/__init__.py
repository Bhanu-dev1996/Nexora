from fastapi import APIRouter

from app.api.v1 import auth, auth_google, users, leads, contacts, companies, deals, tasks, dashboard

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(auth_google.router)
api_router.include_router(users.router)
api_router.include_router(leads.router)
api_router.include_router(contacts.router)
api_router.include_router(companies.router)
api_router.include_router(deals.router)
api_router.include_router(tasks.router)
api_router.include_router(dashboard.router)
