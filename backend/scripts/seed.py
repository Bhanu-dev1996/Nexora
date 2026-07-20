import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select
from app.database import async_session, engine, Base
from app.models import *  # noqa
from app.core.security import hash_password


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        from app.models.organization import Organization
        from app.models.user import User
        from app.models.user_organization import UserOrganization
        from app.models.role import Role, Permission, RolePermission
        from app.models.lead import Lead
        from app.models.contact import Contact
        from app.models.company import Company
        from app.models.deal import Deal
        from app.models.task import Task

        result = await db.execute(select(Organization).limit(1))
        if result.scalars().first():
            print("Database already seeded, skipping.")
            return

        org = Organization(name="Acme Corp", slug="acme-corp", industry="Technology", size="51-200", timezone="America/New_York", currency="USD")
        db.add(org)
        await db.flush()

        permissions_data = [
            ("leads", "create"), ("leads", "read"), ("leads", "update"), ("leads", "delete"), ("leads", "assign"), ("leads", "convert"),
            ("contacts", "create"), ("contacts", "read"), ("contacts", "update"), ("contacts", "delete"),
            ("companies", "create"), ("companies", "read"), ("companies", "update"), ("companies", "delete"),
            ("deals", "create"), ("deals", "read"), ("deals", "update"), ("deals", "delete"), ("deals", "move_stage"),
            ("tasks", "create"), ("tasks", "read"), ("tasks", "update"), ("tasks", "delete"),
            ("users", "read"), ("users", "update"), ("users", "manage"),
            ("settings", "read"), ("settings", "manage"),
        ]
        perm_map = {}
        for resource, action in permissions_data:
            p = Permission(resource=resource, action=action, description=f"{action} {resource}")
            db.add(p)
            await db.flush()
            perm_map[f"{resource}.{action}"] = p

        roles_data = [
            ("Super Admin", "super_admin", True, True),
            ("Organization Admin", "organization_admin", True, False),
            ("Sales Manager", "sales_manager", True, False),
            ("Sales Executive", "sales_executive", True, False),
            ("Viewer", "viewer", True, False),
        ]
        role_map = {}
        for name, slug, is_system, is_default in roles_data:
            role = Role(name=name, slug=slug, is_system=is_system, is_default=is_default, organization_id=org.id)
            db.add(role)
            await db.flush()
            role_map[slug] = role

        for slug, role in role_map.items():
            if slug == "organization_admin":
                for p in perm_map.values():
                    db.add(RolePermission(role_id=role.id, permission_id=p.id))
            elif slug == "viewer":
                for k, p in perm_map.items():
                    if k.endswith(".read"):
                        db.add(RolePermission(role_id=role.id, permission_id=p.id))

        users_data = [
            ("admin@acme.com", "Sarah", "Chen", "organization_admin"),
            ("manager@acme.com", "James", "Wilson", "sales_manager"),
            ("sarah@acme.com", "Sarah", "Johnson", "sales_executive"),
            ("mike@acme.com", "Mike", "Brown", "sales_executive"),
            ("alex@acme.com", "Alex", "Taylor", "viewer"),
        ]
        users = []
        for email, first, last, role in users_data:
            u = User(email=email, password_hash=hash_password("Demo1234!"), first_name=first, last_name=last)
            db.add(u)
            await db.flush()
            db.add(UserOrganization(user_id=u.id, organization_id=org.id, role=role, is_default=True))
            users.append(u)

        companies_data = [
            ("Skynet", "skynet.com", "Technology"),
            ("Wayne Enterprises", "wayne.com", "Conglomerate"),
            ("Stark Industries", "stark.com", "Manufacturing"),
            ("Acme Widgets", "acmewidgets.com", "Retail"),
            ("Globex Corporation", "globex.com", "Technology"),
        ]
        companies = []
        for name, domain, industry in companies_data:
            c = Company(name=name, domain=domain, industry=industry, organization_id=org.id, created_by=users[0].id)
            db.add(c)
            await db.flush()
            companies.append(c)

        contacts_data = [
            ("John", "Connor", "john@skynet.com", companies[0].id),
            ("Bruce", "Wayne", "bruce@wayne.com", companies[1].id),
            ("Tony", "Stark", "tony@stark.com", companies[2].id),
            ("Diana", "Prince", "diana@wayne.com", companies[1].id),
            ("Peter", "Parker", "peter@dailybugle.com", None),
        ]
        contacts = []
        for first, last, email, cid in contacts_data:
            c = Contact(first_name=first, last_name=last, email=email, company_id=cid, organization_id=org.id, owner_user_id=users[0].id, created_by=users[0].id)
            db.add(c)
            await db.flush()
            contacts.append(c)

        leads_data = [
            ("Clark", "Kent", "clark@dailyplanet.com", "new", 45),
            ("Barry", "Allen", "barry@ccpd.gov", "contacted", 72),
            ("Arthur", "Curry", "arthur@atlantis.com", "qualified", 88),
            ("Victor", "Stone", "victor@titans.com", "new", 33),
            ("Hal", "Jordan", "hal@greenlanterns.com", "unqualified", 15),
        ]
        for first, last, email, status, score in leads_data:
            db.add(Lead(first_name=first, last_name=last, email=email, status=status, score=score, organization_id=org.id, owner_user_id=users[0].id, created_by=users[0].id))

        deals_data = [
            ("Skynet Enterprise License", 120000, "proposal", companies[0].id),
            ("Wayne Security Audit", 85000, "discovery", companies[1].id),
            ("Stark IoT Platform", 250000, "negotiation", companies[2].id),
            ("Acme CRM Migration", 45000, "qualification", companies[3].id),
            ("Globex Annual Contract", 180000, "closed_won", companies[4].id),
        ]
        for title, amount, stage, cid in deals_data:
            status = "won" if stage == "closed_won" else "open"
            db.add(Deal(title=title, amount=amount, stage=stage, status=status, company_id=cid, organization_id=org.id, owner_user_id=users[0].id, created_by=users[0].id))

        tasks_data = [
            ("Follow up with Clark Kent", "high", "pending"),
            ("Send proposal to Wayne Enterprises", "medium", "in_progress"),
            ("Demo call with Tony Stark", "high", "pending"),
            ("Review Q3 pipeline", "low", "completed"),
            ("Prepare monthly report", "medium", "pending"),
        ]
        for title, priority, status in tasks_data:
            db.add(Task(title=title, priority=priority, status=status, organization_id=org.id, created_by=users[0].id, assigned_to=users[0].id))

        await db.commit()
        print("Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
